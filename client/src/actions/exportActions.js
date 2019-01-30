var fileDownload = require('js-file-download');

// Register New User
export const exportSimpleData = () => dispatch => {
    var data = ["dog", "cat", "mouse"];
    fileDownload(data, 'simple.csv')

    


    //   if(currentUserIsAdmin().isValid){
    //     console.log("curUserIsAdmin has been confirmed to be true");
    //     axios
    //     .post("/api/users/register", userData)
    //     //.then(res => history.push("/login")) // re-direct to login on successful register
    //     .then(res => history.push("/skus")) //re-direct to skus on successful register.
    //     .catch(err =>
    //       dispatch({
    //         type: GET_ERRORS,
    //         payload: err.response.data
    //       })
    //     );
    //   }
};