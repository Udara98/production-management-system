const ajaxGetRequest = (url) =>{
    let serviceResponse;

    $.ajax(url,{
        async:false,
        type:"GET",
        contentType:"Json",
        success: function (data){
            console.log("Success",data);
            serviceResponse = data;

        },
        error: function (resob){
            console.log("Error",resob)
            serviceResponse = [];
        }
    });
    return serviceResponse;
}

//Define function for ajax request (POST, PUT, DELETE)
const ajaxRequestBody = (url, method, object) =>{
    //3. Pass data into backend
    let serverResponse ;
    //jquery ajax("URL, (option)")
    $.ajax(url,{
        type: method,
        data: JSON.stringify(object),
        contentType: "application/json",
        async:false,
        success: function (data,status,ahr){
            console.log(url , "\n", "Success " , status , " " , ahr);
            console.log(data)
            serverResponse = ahr;
        },
        error:function (ahr,status, errormsg){
            console.log(url , "\n", "Fail" , errormsg , " " , status , " " , ahr);
            serverResponse = ahr;
        }
        ,
    } );
    return serverResponse;
}

const ajaxFormDataBody = (url, method, object)=>{
    let serverResponse ;
    $.ajax(url,{
        type: method,
        data: object,
        contentType: false,
        processData: false,
        async:false,
        success: function (data,status,ahr){
            console.log(url , "\n", "Success " , status , " " , ahr);
            console.log(data)
            serverResponse = ahr;
        },
        error:function (ahr,status, errormsg){
            console.log(url , "\n", "Fail" , errormsg , " " , status , " " , ahr);
            serverResponse = ahr;
        }
        ,
    } );
    return serverResponse;
}

const ajaxDeleteRequest = (url) =>{
    let serverResponse ;
    $.ajax(url,{
        type: "DELETE",
        contentType: "application/json",
        async:false,
        success: function (data,status,ahr){
            console.log(url , "\n", "Success " , status , " " , ahr);
            console.log(data)
            serverResponse = ahr;
        },
        error:function (ahr,status, errormsg){
            console.log(url , "\n", "Fail" , errormsg , " " , status , " " , ahr);
            serverResponse = ahr;
        }
        ,
    } );
    return serverResponse;
}