// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

export default class SubmitRequest{

  static submitGetData = (page_name, obj) => {
    fetch('/api/' + page_name, { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) obj.setState({ error: res.error });
            else obj.setState({ 
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

  static submitGetIngredientsByNameSubstring(substr, obj) {
    fetch('/api/ingredients_name/' + substr)
      .then(data => data.json())
      .then((res) => {
        console.log(res.data);
        if (!res.success) obj.setState({ error: res.error });
        else return res.data;
      });
}



static submitGetPagination(obj) {

    fetch('/api/ingredientspagget', { method: 'GET' })
          .then(data => data.json())
          .then((res) => {
            if (!res.success) obj.setState({ error: res.error });
            else obj.setState({ 
                data: res.data,
                loaded: true
            });
          });
  }
}