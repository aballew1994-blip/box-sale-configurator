/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 *
 * Box Sale Configurator — Item Search RESTlet
 *
 * Searches inventory/non-inventory/service/assembly items by keyword.
 * Returns paginated results with pricing data.
 *
 * GET params: q (search query), limit (default 25), offset (default 0), id (single item lookup)
 */
define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

  /**
   * Handle GET requests — item search or single item lookup.
   */
  function onGet(requestParams) {
    try {
      // Single item lookup by ID
      if (requestParams.id) {
        return getItemById(requestParams.id);
      }

      // Search by keyword
      const query = requestParams.q || '';
      const limit = Math.min(parseInt(requestParams.limit) || 25, 100);
      const offset = parseInt(requestParams.offset) || 0;

      if (!query || query.length < 2) {
        return { items: [], total: 0, hasMore: false };
      }

      return searchItems(query, limit, offset);

    } catch (e) {
      log.error({ title: 'Item Search Error', details: e.message });
      throw e;
    }
  }

  /**
   * Search items across multiple types.
   */
  function searchItems(query, limit, offset) {
    const filters = [
      ['isinactive', 'is', 'F'],
      'AND',
      [
        ['itemid', 'contains', query],
        'OR',
        ['displayname', 'contains', query],
        'OR',
        ['description', 'contains', query],
        'OR',
        ['manufacturer', 'contains', query]
      ]
    ];

    const columns = [
      search.createColumn({ name: 'internalid' }),
      search.createColumn({ name: 'itemid' }),
      search.createColumn({ name: 'displayname' }),
      search.createColumn({ name: 'description' }),
      search.createColumn({ name: 'manufacturer' }),
      search.createColumn({ name: 'type' }),
      search.createColumn({ name: 'cost' }),
      search.createColumn({ name: 'baseprice' }),
      search.createColumn({ name: 'quantityavailable' }),
    ];

    const itemSearch = search.create({
      type: search.Type.ITEM,
      filters: filters,
      columns: columns,
    });

    const results = [];
    let total = 0;

    const pagedData = itemSearch.runPaged({ pageSize: limit });
    total = pagedData.count;

    if (total === 0) {
      return { items: [], total: 0, hasMore: false };
    }

    // Calculate which page to fetch
    const pageIndex = Math.floor(offset / limit);
    if (pageIndex < pagedData.pageRanges.length) {
      const page = pagedData.fetch({ index: pageIndex });
      page.data.forEach((result) => {
        results.push({
          internalId: result.getValue('internalid'),
          itemId: result.getValue('itemid'),
          displayName: result.getValue('displayname') || '',
          description: result.getValue('description') || '',
          manufacturer: result.getText('manufacturer') || result.getValue('manufacturer') || '',
          itemType: result.getValue('type'),
          isActive: true,
          cost: parseFloat(result.getValue('cost')) || 0,
          basePrice: parseFloat(result.getValue('baseprice')) || 0,
          quantityAvailable: parseInt(result.getValue('quantityavailable')) || 0,
        });
      });
    }

    return {
      items: results,
      total: total,
      hasMore: (offset + limit) < total,
    };
  }

  /**
   * Get a single item by internal ID or item ID.
   */
  function getItemById(id) {
    // Try as internal ID first
    let itemRecord;
    try {
      // Search by itemid field
      const itemSearch = search.create({
        type: search.Type.ITEM,
        filters: [
          ['itemid', 'is', id],
          'OR',
          ['internalid', 'anyof', id],
        ],
        columns: [
          'internalid', 'itemid', 'displayname', 'description',
          'manufacturer', 'type', 'cost', 'baseprice', 'quantityavailable', 'isinactive',
        ],
      });

      const results = itemSearch.run().getRange({ start: 0, end: 1 });

      if (results.length === 0) {
        return null;
      }

      const r = results[0];
      return {
        internalId: r.getValue('internalid'),
        itemId: r.getValue('itemid'),
        displayName: r.getValue('displayname') || '',
        description: r.getValue('description') || '',
        manufacturer: r.getText('manufacturer') || r.getValue('manufacturer') || '',
        itemType: r.getValue('type'),
        isActive: r.getValue('isinactive') !== 'T',
        cost: parseFloat(r.getValue('cost')) || 0,
        basePrice: parseFloat(r.getValue('baseprice')) || 0,
        quantityAvailable: parseInt(r.getValue('quantityavailable')) || 0,
      };

    } catch (e) {
      log.error({ title: 'Get Item Error', details: e.message });
      return null;
    }
  }

  return {
    get: onGet,
  };
});
