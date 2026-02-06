/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Box Sale Configurator — Data Fetch RESTlet
 *
 * Fetches estimate header + customer data for the configurator.
 *
 * GET params: estimateId (required)
 */
define(['N/record', 'N/search', 'N/log', 'N/error'], (record, search, log, error) => {

  /**
   * Handle GET requests — fetch estimate and customer data.
   */
  function onGet(requestParams) {
    const estimateId = requestParams.estimateId;

    if (!estimateId) {
      throw error.create({
        name: 'MISSING_PARAM',
        message: 'estimateId parameter is required',
      });
    }

    try {
      // Load the estimate record
      const estimate = record.load({
        type: record.Type.ESTIMATE,
        id: estimateId,
      });

      const customerId = estimate.getValue({ fieldId: 'entity' });

      // Build estimate data
      const estimateData = {
        internalId: estimateId,
        tranId: estimate.getValue({ fieldId: 'tranid' }) || '',
        status: estimate.getText({ fieldId: 'status' }) || '',
        salesRep: estimate.getText({ fieldId: 'salesrep' }) || '',
        salesRepEmail: '',
        tranDate: estimate.getValue({ fieldId: 'trandate' }) || '',
        memo: estimate.getValue({ fieldId: 'memo' }) || '',
      };

      // Try to get sales rep email
      const salesRepId = estimate.getValue({ fieldId: 'salesrep' });
      if (salesRepId) {
        try {
          const empSearch = search.lookupFields({
            type: search.Type.EMPLOYEE,
            id: salesRepId,
            columns: ['email'],
          });
          estimateData.salesRepEmail = empSearch.email || '';
        } catch (e) {
          log.debug({ title: 'Sales Rep Email Lookup', details: e.message });
        }
      }

      // Load customer data
      let customerData = {
        internalId: String(customerId),
        name: estimate.getText({ fieldId: 'entity' }) || '',
        email: '',
        phone: '',
        billingAddress: null,
        shippingAddress: null,
      };

      if (customerId) {
        try {
          const customer = record.load({
            type: record.Type.CUSTOMER,
            id: customerId,
          });

          customerData.email = customer.getValue({ fieldId: 'email' }) || '';
          customerData.phone = customer.getValue({ fieldId: 'phone' }) || '';

          // Billing address
          const billAddrSubrecord = customer.getSubrecord({
            fieldId: 'billingaddress',
          });

          if (billAddrSubrecord) {
            customerData.billingAddress = {
              addressee: billAddrSubrecord.getValue({ fieldId: 'addressee' }) || '',
              addr1: billAddrSubrecord.getValue({ fieldId: 'addr1' }) || '',
              addr2: billAddrSubrecord.getValue({ fieldId: 'addr2' }) || '',
              city: billAddrSubrecord.getValue({ fieldId: 'city' }) || '',
              state: billAddrSubrecord.getValue({ fieldId: 'state' }) || '',
              zip: billAddrSubrecord.getValue({ fieldId: 'zip' }) || '',
              country: billAddrSubrecord.getText({ fieldId: 'country' }) || '',
            };
          }

          // Shipping address
          const shipAddrSubrecord = customer.getSubrecord({
            fieldId: 'shippingaddress',
          });

          if (shipAddrSubrecord) {
            customerData.shippingAddress = {
              addressee: shipAddrSubrecord.getValue({ fieldId: 'addressee' }) || '',
              addr1: shipAddrSubrecord.getValue({ fieldId: 'addr1' }) || '',
              addr2: shipAddrSubrecord.getValue({ fieldId: 'addr2' }) || '',
              city: shipAddrSubrecord.getValue({ fieldId: 'city' }) || '',
              state: shipAddrSubrecord.getValue({ fieldId: 'state' }) || '',
              zip: shipAddrSubrecord.getValue({ fieldId: 'zip' }) || '',
              country: shipAddrSubrecord.getText({ fieldId: 'country' }) || '',
            };
          }

        } catch (custError) {
          log.error({
            title: 'Customer Load Error',
            details: custError.message,
          });
        }
      }

      return {
        estimate: estimateData,
        customer: customerData,
      };

    } catch (e) {
      log.error({
        title: 'Data Fetch Error',
        details: `${e.name}: ${e.message}`,
      });

      throw error.create({
        name: 'DATA_FETCH_FAILED',
        message: e.message,
      });
    }
  }

  return {
    get: onGet,
  };
});
