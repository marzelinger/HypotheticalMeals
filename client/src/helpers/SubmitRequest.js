// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

import * as Constants from './../resources/Constants';
import printFuncFront from '../printFuncFront';

export default class SubmitRequest{

  static async addAllCustomers() {
    var customers = await fetch('/api/scrape_customers', { method: 'GET' })
    .then(data => data.json())
    .then((res) => {
      if (!res.success) return { success: res.success, error: res.error };
      else return{ 
        success: res.success,
        data: res.data
      };
    });
    customers.data.forEach((customer) => {
      SubmitRequest.submitCreateItem('customers', customer);
    })
  }

  // TODO: make this understand time limits
  static async addNewSkuRecords(sku_num) {
    fetch(`/api/scrape_new_sku`, { method: 'PUT' , headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({sku_num})})

  }

  static async addNewSkuRecordsBulk(sku_nums) {
    fetch(`/api/scrape_new_sku_bulk`, { method: 'PUT' , headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({sku_nums})})
  }

  static async updateSkuRecords() {
    console.log('here')
    fetch(`/api/update_all`, { method: 'GET' })
  }

  static async submitReset() {
    fetch(`/api/trigger_reset`, { method: 'GET' });
  }

  static submitQueryString(query) {
    return fetch(query, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) return { success: res.success, error: res.error };
            else return{ 
              success: res.success,
              data: res.data,
              status: res.status
            };
            
          });
  }

  static submitGetData = (page_name) => {
    try {
      return fetch('/api/' + page_name, { method: 'GET' })
        .then(data => data.json())
        .then((res) => {
          if (!res.success) return { success: res.success, error: res.error };
          else return ({ 
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
      //console.log(item);
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
        //console.log(res);
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

  static async submitGetSkusByProductLineID(id) {
    try {
      //console.log("this is the id in request: "+id);
      return fetch('/api/skus/prodline/' + id)
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
  

  static async submitGetCustomerByID(id) {
    try {
      return fetch('/api/customers/' + id)
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


  static async submitGetFormulaByID(id) {
    try {
      return fetch('/api/formulas/' + id)
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
      //console.log('/api/manulines_shortname/' + shortname);
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

  static async submitGetProductLinesByNameSubstring(substr, currentPage, pageSize) {
    try {
      return fetch('/api/products_name/' + substr +'/'+currentPage+'/'+pageSize)
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

  static async submitGetFormulasByNameSubstring(substr) {
    try {
      return fetch('/api/formulas_name/' + substr)
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



  static async submitGetCustomersByNameSubstring(substr) {
    //console.log("this is the sub here: "+substr);
    try {
      return fetch('/api/customers_name/' + substr)
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

  static async submitGetSkuByID(id) {
    try {
      return fetch('/api/skus/' + id)
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

  static async submitGetUserByID(id) {
    try {
      return fetch('/api/users/' + id)
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

  static submitGetSaleRecordsByFilter = (sort_field, customer_id, prod_line_ids, sku_id, date_range_start, date_range_end, currentPage, pageSize) => {
    //console.log("path is: "+ sort_field + '/' + customer_id + '/' + prod_line_ids + '/' + sku_id + '/' + 
    //date_range_start + '/' + date_range_end + '/' + currentPage + '/' + pageSize);
    return fetch('/api/records_filter/' + sort_field + '/' + customer_id + '/' + prod_line_ids + '/' + sku_id + '/' + 
                  date_range_start + '/' + date_range_end + '/' + currentPage + '/' + pageSize, {method: 'GET'})
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

  static submitGetFilterData = (route, sort_field, filter_value, keyword, currentPage, pageSize, prod_line, formula) => {
    var path = '/api/' + route + '/' + sort_field + '/' + filter_value + '/' + keyword + '/' + currentPage +'/' + pageSize;
    path += (prod_line === undefined) ? '' : ('/' + prod_line);
    path += (formula === undefined) ? '' : ('/' + formula);
    //printFuncFront("this is path in submitGetFilterData"+path);
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


  static async submitGetSKUsByManuLine(id) {
    // console.log("this is the id: "+id);
    try {
      return fetch('/api/skus/manu_line_id/' + id)
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


  static async submitGetManufacturingActivitiesBySKU(sku_id, start, end) {
    try {
      // console.log("THIS IS THE SKU: "+JSON.stringify(sku_id));
      console.log("sku: "+sku_id+"     start;    "+start+"       end: "+end);
      return fetch('/api/manuactivities/' + sku_id+'/'+start+'/'+end)
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


  static async submitGetManufacturingActivitiesForReport(reportData) {
    try {
      return fetch(`/api/manuactivities/${reportData.manu_line._id}/${reportData.start_date}/${reportData.end_date}/${reportData.duration}`)
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

  static submitGetDataPaginated = (page_name, currentPage, pageSize) => {
    try {
      return fetch('/api/' + page_name+'/'+currentPage+'/'+pageSize, { method: 'GET' })
        .then(data => data.json())
        .then((res) => {
          if (!res.success) return { success: res.success, error: res.error };
          else return ({ 
              success: res.success,
              data: res.data
          });
        });
      }
    catch (err){
      return { success: false, error: err };
    }
  }







}

