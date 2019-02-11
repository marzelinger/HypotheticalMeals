// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

import * as Constants from './../resources/Constants';

export default class SubmitRequest{

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

  static async submitGetProductLinesByNameSubstring(substr) {
    try {
      console.log("here")
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
        console.log(res.data);
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
  
}