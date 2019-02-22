// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

import * as Constants from './../resources/Constants';

export default class SubmitRequest{

  static submitEnableUpdate(activities, enable) {
    console.log("submit enabled");
    var ids = activities.map((activity => activity._id));
    console.log(ids);
    var body = {ids, enable};
    try {
      return fetch('/api/manuactivities_enable', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(res => res.json()).then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { success: res.success, data: res.data};
      });
    }
    catch (err){
      console.log('here');
      return { success: false, error: err };
    }
  }

  static submitQueryString(query) {
    return fetch(query, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) return { success: res.success, error: res.error };
            else return{ 
              success: res.success,
              data: res.data
            };
            
          });
  }

  static submitGetData = (page_name) => {
    try {
      return fetch('/api/' + page_name, { method: 'GET' })
        .then(data => data.json())
        .then((res) => {
          if (!res.success) return { success: res.success, error: res.error };

          else 
          return ({ 
              success: res.success,
              data: res.data
          });
        });
      }
    catch (err){
      return { success: false, error: err };
    }
  }

  static submitCreateItem = (route, item) => {
    try {
      console.log(item);
      return fetch(`/api/${route}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).then(res => res.json()).then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { success: res.success, data: res.data};
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static submitUpdateItem = (route, item) => {
    try {
      console.log('update item')
      return fetch(`/api/${route}/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }).then(res => res.json()).then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { success: res.success, data: res.data};
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static submitDeleteItem = (route, item) => {
    try {
      return fetch(`/api/${route}/${item._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()).then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { success: res.success, data: res.data};
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetIngredientsByNameSubstring(substr) {
    try {
      return fetch('/api/ingredients_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return {
          success: res.success,
          data: res.data
        }
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetProductLineByID(id) {
    try {
      return fetch('/api/products/' + id)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { 
          success: res.success,
          data: res.data
        } ;
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetManufacturingLineByShortName(shortname) {
    try {
      console.log('/api/manulines_shortname/' + shortname);
      return fetch('/api/manulines_shortname/' + shortname)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { 
          success: res.success,
          data: res.data
        } ;
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetProductLinesByNameSubstring(substr) {
    try {
      return fetch('/api/products_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return {
          success: res.success,
          data: res.data
        }
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetSkusByNameSubstring(substr) {
    try {
      return fetch('/api/skus_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return {
          success: res.success,
          data: res.data
        }
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetIngredientByID(id) {
    try {
      return fetch('/api/ingredients/' + id)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { 
          success: res.success,
          data: res.data
        } ;
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static submitGetManuGoalsByFilter = (name_filter, username_filter, user) => {
    return fetch(`/api/manugoals_filter/${name_filter || '_'}/${username_filter || '_'}/${user}`, {method: 'GET'})
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return ({ 
            success: res.success,
            data: res.data
          }
        )
      }
    )
  }

  static submitGetFilterData = (route, sort_field, filter_value, keyword, currentPage, pageSize, prod_line) => {
    var path = '/api/' + route + '/' + sort_field + '/' + filter_value + '/' + keyword + '/' + currentPage +'/' + pageSize;
    path += (prod_line === undefined) ? '' : ('/' + prod_line);
    return fetch(path, { method: 'GET' })
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return ({ 
            success: res.success,
            data: res.data
          }
        )
      }
      );
  }
  
  static submitGetManuGoalsData(user) {
    return fetch(`/api/manugoals/${user}`, { method: 'GET' })
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { error: res.error } ;
        else return { 
          success: res.success,
          data: res.data
        };
        
      });
  }

  static submitUpdateGoal(user, id, item) {
    return fetch(`/api/manugoals/${user}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then(res => res.json()).then((res) => {
      if (!res.success) return { success: res.success, error: res.error };
      else return { success: res.success };
    });
  }

  static submitGetPopulatedSkuIngredients = (skuId) => {
    return fetch(`/api/ingredients_by_sku/${skuId}`, { method: 'GET' })
    .then(data => data.json())
    .then((res) => {
      if (!res.success) return { success: res.success, error: res.error };
      else return {
        success: res.success,
        data: res.data,
        skuData: res.skuData
      }
    });
  }

  static submitGetManufacturingLinesByNameSubstring(substr) {
    try {
      return fetch('/api/manulines_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return {
          success: res.success,
          data: res.data
        }
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetManufacturingLineByID(id) {
    try {
      return fetch('/api/manulines/' + id)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { 
          success: res.success,
          data: res.data
        } ;
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }

  static async submitGetManufacturingActivityByID(id) {
    try {
      return fetch('/api/manuactivities/' + id)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return { success: res.success, error: res.error };
        else return { 
          success: res.success,
          data: res.data
        } ;
      });
    }
    catch (err){
      return { success: false, error: err };
    }
  }
}