// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

export default class SubmitRequest{

  static submitGetData = (page_name) => {
    return fetch('/api/' + page_name, { method: 'GET' })
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return ({ error: res.error });
        else return ({ 
            data: res.data,
            loaded: true
        });
      });
  }

  static submitCreateItem = (route, item, obj) => {
    fetch(`/api/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then(res => res.json()).then((res) => {
      if (!res.success) obj.setState({ error: res.error.message || res.error });
      else console.log(res);
    });
  }

  static submitUpdateItem = (route, item, obj) => {
    fetch(`/api/${route}/${item._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    }).then(res => res.json()).then((res) => {
      if (!res.success) obj.setState({ error: res.error.message || res.error });
      else console.log(res);
    });
  }

  static submitDeleteItem = (route, item, obj) => {
    fetch(`/api/${route}/${item._id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json()).then((res) => {
      if (!res.success) obj.setState({ error: res.error.message || res.error });
      else console.log(res);
    });
  }

  static async submitGetIngredientsByNameSubstring(substr, obj) {
    try {
      return fetch('/api/ingredients_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) obj.setState({ error: res.error });
        else return res.data;
      });
    }
    catch (err) {
      return err;
    }
  }

  static async submitGetSkusByNameSubstring(substr, obj) {
    try {
      return fetch('/api/skus_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        if (!res.success) obj.setState({ error: res.error });
        else return res.data;
      });
    }
    catch (err) {
      return err;
    }
  }

  static async submitGetIngredientsByID(id) {
    try {
      return fetch('/api/ingredients/' + id)
      .then(data => data.json())
      .then((res) => {
        console.log(res.data);
        if (!res.success) return ({ error: res.error });
        else return { data: res.data} ;
      });
    }
    catch (err) {
      return err;
    }
  }

  static submitGetFilterData = (path, filter_value, keyword) => {
    return fetch('/api/' + path + '/' + filter_value + '/' + keyword, { method: 'GET' })
      .then(data => data.json())
      .then((res) => {
        if (!res.success) return ({ error: res.error });
        else return ({ 
            data: res.data,
            loaded: true
        });
      });
  }

}