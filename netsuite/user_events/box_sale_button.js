/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * Box Sale Configurator — Estimate Button
 *
 * Adds a "Configure Box Sale" button to the Estimate form.
 * The button opens the external configurator app in a new tab,
 * passing the Estimate internal ID as a URL parameter.
 */
define(['N/log', 'N/runtime', 'N/url'], (log, runtime, url) => {

  // Set this to your deployed configurator URL
  const CONFIGURATOR_BASE_URL = 'https://configurator.example.com';

  /**
   * Runs before the form is rendered to the user.
   * Adds the "Configure Box Sale" button.
   */
  function beforeLoad(context) {
    // Only add button on View and Edit modes
    if (
      context.type !== context.UserEventType.VIEW &&
      context.type !== context.UserEventType.EDIT
    ) {
      return;
    }

    const form = context.form;
    const estimateId = context.newRecord.id;

    if (!estimateId) return;

    const configuratorUrl = `${CONFIGURATOR_BASE_URL}/configure?estimateId=${estimateId}`;

    form.addButton({
      id: 'custpage_configure_box_sale',
      label: 'Configure Box Sale',
      functionName: `window.open('${configuratorUrl}', '_blank')`,
    });

    log.debug({
      title: 'Box Sale Button Added',
      details: `Estimate ID: ${estimateId}`,
    });
  }

  return {
    beforeLoad: beforeLoad,
  };
});
