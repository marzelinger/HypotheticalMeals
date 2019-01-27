// SubmitRequest.js
// Riley
// Simple functions for submitting HTTP requests from the front end

export default class SubmitRequest{

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

}