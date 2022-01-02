$(function () {

    
    const auth_code = localStorage.getItem("suth_code");
    
    if (!auth_code){
        $('#modal').show();
    }

    $("#submit_auth_code").on("click", () => {
        // 获取输入框的内容， 并判断是否存在内容
        let input_auth_code = $("#auth_code").val();
        if (input_auth_code == "" || input_auth_code == undefined){
            $("#auth_code").focus();
            $("#auth_code").attr("placeholder", "Please Set An AuthCode!");
        }
        else{
            // 如果输入的值合法就存入网站数据
            localStorage.setItem("suth_code", input_auth_code);
            $('#modal').hide();
        }
    })

});