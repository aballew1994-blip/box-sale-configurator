/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Box Sale Configurator — Estimate Writer RESTlet
 *
 * Writes line items to a NetSuite Estimate with idempotency protection.
 *
 * POST body: {
 *   estimateId: string,
 *   idempotencyKey: string,
 *   configVersion: number,
 *   replaceLines: boolean,
 *   lines: [{ itemId, quantity, rate, description, customColumns }]
 * }
 */
define(['N/record', 'N/log', 'N/error'], (record, log, error) => {

  /**
   * Handle POST requests — write lines to estimate.
   */
  function onPost(requestBody) {
    const {
      estimateId,
      idempotencyKey,
      configVersion,
      replaceLines,
      lines
    } = requestBody;

    log.audit({
      title: 'Estimate Writer',
      details: `estimateId=${estimateId}, key=${idempotencyKey}, lines=${lines.length}`
    });

    if (!estimateId || !idempotencyKey || !lines || lines.length === 0) {
      throw error.create({
        name: 'INVALID_REQUEST',
        message: 'Missing required fields: estimateId, idempotencyKey, lines',
      });
    }

    try {
      // Load the estimate
      const estimate = record.load({
        type: record.Type.ESTIMATE,
        id: estimateId,
        isDynamic: true,
      });

      // Check idempotency — has this exact key already been processed?
      const existingKey = estimate.getValue({
        fieldId: 'custbody_box_config_key',
      });

      if (existingKey === idempotencyKey) {
        log.audit({
          title: 'Idempotency Hit',
          details: `Key ${idempotencyKey} already processed. Returning success.`
        });

        return {
          success: true,
          estimateId: estimateId,
          lineCount: lines.length,
          warnings: ['Idempotency key matched — no changes made (already processed).'],
          idempotencyKey: idempotencyKey,
        };
      }

      // If replaceLines is true, remove all existing lines tagged with custcol_box_config
      if (replaceLines) {
        removeConfigLines(estimate);
      }

      // Add new lines
      const warnings = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        try {
          estimate.selectNewLine({ sublistId: 'item' });

          estimate.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: parseInt(line.itemId),
          });

          estimate.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: line.quantity,
          });

          if (line.rate !== undefined) {
            estimate.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'rate',
              value: line.rate,
            });
          }

          if (line.description) {
            estimate.setCurrentSublistValue({
              sublistId: 'item',
              fieldId: 'description',
              value: line.description,
            });
          }

          // Set custom columns
          if (line.customColumns) {
            if (line.customColumns.custcol_box_config !== undefined) {
              estimate.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_box_config',
                value: line.customColumns.custcol_box_config,
              });
            }

            if (line.customColumns.custcol_tariff_pct !== undefined) {
              estimate.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_tariff_pct',
                value: line.customColumns.custcol_tariff_pct,
              });
            }

            if (line.customColumns.custcol_tariff_amt !== undefined) {
              estimate.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_tariff_amt',
                value: line.customColumns.custcol_tariff_amt,
              });
            }
          }

          estimate.commitLine({ sublistId: 'item' });

        } catch (lineError) {
          warnings.push(`Line ${i + 1} (item ${line.itemId}): ${lineError.message}`);
          log.error({
            title: 'Line Write Error',
            details: `Line ${i + 1}: ${lineError.message}`
          });
        }
      }

      // Set idempotency key and config ID on the estimate body
      estimate.setValue({
        fieldId: 'custbody_box_config_key',
        value: idempotencyKey,
      });

      // Save the estimate
      const savedId = estimate.save({
        enableSourcing: true,
        ignoreMandatoryFields: false,
      });

      log.audit({
        title: 'Estimate Saved',
        details: `ID=${savedId}, lines=${lines.length}, warnings=${warnings.length}`
      });

      return {
        success: true,
        estimateId: String(savedId),
        lineCount: lines.length,
        warnings: warnings,
        idempotencyKey: idempotencyKey,
      };

    } catch (e) {
      log.error({
        title: 'Estimate Writer Error',
        details: `${e.name}: ${e.message}`
      });

      throw error.create({
        name: 'ESTIMATE_WRITE_FAILED',
        message: e.message,
      });
    }
  }

  /**
   * Remove all lines tagged with custcol_box_config = true.
   * Iterates in reverse to avoid index shifting.
   */
  function removeConfigLines(estimate) {
    const lineCount = estimate.getLineCount({ sublistId: 'item' });

    for (let i = lineCount - 1; i >= 0; i--) {
      const isConfigLine = estimate.getSublistValue({
        sublistId: 'item',
        fieldId: 'custcol_box_config',
        line: i,
      });

      if (isConfigLine === true || isConfigLine === 'T') {
        estimate.removeLine({
          sublistId: 'item',
          line: i,
        });
      }
    }
  }

  return {
    post: onPost,
  };
});
