const upload_files = new Map();

const download_files = new Map();

const select_files = new Map();

// show upload/download file list on right
showFileList = (type) => {
    $(".file-list-input-wrapper").empty();
    $("#file-list").show(500);
    switch(type){
        case "upload": 
            $(".file-list-header").text("Upload Files");
            // disableButton("download");
            $("#submit").text("Upload");
            break;

        case "download":{
            $(".file-list-header").text("Download Files");
            // disableButton("upload");
            // init the data from http response
            $("#submit").text("Download");
            break;
        }
    }
}

// clean the upload file lists when cancel or upload files success
cleanFileList = () => {
    // clear upload file list
    upload_files.clear();
    // clear download file list
    download_files.clear();
    // remove all item in file list window
    $(".file-list-input-wrapper").empty();
}

$("#cancel").on("click", function(){
    cancelAction();
})

cancelAction = () => {
    $('#file-list').hide(500);
    enableButton();
    cleanFileList();
    $("#submit").text("Submit");
}

disableButton = (type) => {
    switch(type){
        case "upload":
            $('#upload').attr('disabled',true);
            $('#upload').css('color',"rgb(0, 0, 0)");
            break;
        case "download":
            $('#download').attr('disabled',true);
            $('#download').css('color',"rgb(0, 0, 0)");
    }
}


enableButton = (type) => {
    switch(type){
        case "upload":
            $('#upload').css('disabled',false);
            $('#upload').css('color',"rgb(255, 255, 255)");
            break;
        case "download":
            $('#upload').css('disabled',false);
            $('#download').css('color',"rgb(255, 255, 255)");
            break;
        default:
            $('#upload').css('disabled',false);
            $('#upload').css('color',"rgb(255, 255, 255)");
            $('#upload').css('disabled',false);
            $('#download').css('color',"rgb(255, 255, 255)");
            break;
    }
}

// Click index upload button will do this
$('#upload').on('click', () => {
    // first should init an empty file list
    // clear the files that choosed by last
    $("#upload-file").val('');
    // mock hidden file input click 
    $("#upload-file").trigger('click');
    // add file to right file list before every times user selected a new file 
    $("#upload-file").change(function(e){
        showFileList("upload")
        appendFileToList(e.currentTarget.files)
        // clear all files after save to local let
        $("#upload-file").val('');
    });
})


const appendFileToList = (input_files) => {
    let item_html;
    for (let i = 0; i < input_files.length; i++){
        const file = input_files[i]
        // Add every file to upload file list
        upload_files.set($.md5(file.name), file);
        // append file to upload file list window
        appendFileToList(file)
        item_html = 
            "<div class='file-list-border-wrapper'>" + 
                "<input type='button' "+
                    "id='" + $.md5(file.name) + 
                    "' value='"+ file.name +
                    "' class='file-list-border-item'>"+
                    "<label name="+ $.md5(file.name) +" style='font-size: 13px; text-align: center; margin-left: 5px'>"+ `${(file.size > 1000 * 1024) ? 
                        ((file.size) / (1024 * 1000)).toFixed(2)+" MB" : ((file.size) / (1 * 1000)).toFixed(2) +" KB"}`+
                    "</label>" +
            "</div>"
        $(".file-list-input-wrapper").append(item_html);
    }
    if (upload_files.size < 0){
        cancelAction();  
    } 
}

// Click index download button will do this 
$('#download').on('click', () => {
    // should open an empty file list first
    showFileList("download")
    // then need get file list from remote server
    $.ajax({
        type: 'POST',
        url: "http://localhost:4040/files/get_list",
        dataType: "json",
        headers:{"auth_code":"jjk"},
        success: (res) => {
            console.log(res);
            appendFileToList(res.file_list.map(file => ({
                name: file.file_name,
                size: file.size
            })))
        },
        error: (error) => {
            console.log(error);
        }
    });
    // change submit button value when all data was loading fish 
   
    
})

// This is what will do when click file list element 
$('.file-list-input-wrapper').on('click', ".file-list-border-item", (e) => {
    const chose_file_item = $(e.target)
    let file_id = $(e.target).attr( "id" );
    let css_value = "linear-gradient(to left, rgb(232, 25, 139), rgb(14, 180, 221))"
    if (chose_file_item.css("background-image") == css_value){
        chose_file_item.css("background-image","");
        select_files.delete(file_id);
    }else{
        chose_file_item.css("background-image", css_value)
        select_files.set(file_id, $(e.target).attr( "value" ));
    }
})

// remove the items which was selected
$("#del").on("click", () => {
    switch ($(".file-list-header").text()) {
        case "Upload Files":
            for (let file_id of select_files.keys() ){
                $("#" + file_id).parent().remove();
                if ($("#submit").text() === "Upload"){
                    upload_files.delete(file_id);
                }
                select_files.delete(file_id);
            }
            if (upload_files.size === 0){
                cancelAction()
            }
            break;
        case "Download Files":
            const file_names = [];
            select_files.forEach((value, key) => { file_names.push(value) });
            $.ajax({
                type: 'POST',
                url: "http://localhost:4040/files/delete",
                dataType: "json",
                data: {"file_names": file_names},
                headers:{"auth_code":"jjk"},
                success: (ret) => {
                    for (file_id of select_files.keys()){
                        $("#" + file_id).parent().remove();
                    }
                    console.log(ret);
                }
            });
            break    
        default:
            break;
    }
})


// submit button will upload file(s) or download file(s)
$('#submit').on('click', () => {
    switch($("#submit").text()){
        case "Upload":
            // TODO: Should get right upload file list, and to upload to remote server 
            // should use for of to upload file to reshow loading progress bar
            uploadAllToServer(upload_files);
            // should close file list when all file are upload successfully
            
            break; 
        case "Download":
            // TODO: Should need get all file user selected file on right file list window
            console.log(select_files);
            // need use for of do those downloads to reshow download pregress bar
            downloadAllToServer(select_files);
            // should close download file list when user down load all files he need
            // $('#file-list').hide(500);
            break;
        default: 
            alert("Please Click Upload Or Download Button And Select File(s) First!")
    }

})

$("#cancel").on("click", () => {
   cancelAction()
})

const uploadAllToServer = (files) => {
    for (let file of files){   
        var data = new FormData();
        data.append("file", file[1]);
        data.append("auth_code", "jjk");
        $.ajax({
            type: 'POST',
            url: "http://localhost:4040/files/upload",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            headers:{"auth_code":"jjk"},
            xhr: () => {
                let xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener("progress", (event) => {
                        //已经上传大小情况
                        let loaded = event.loaded;     
                        // 附件总大小 
                        let tot = event.total;
                        // 上传百分比
                        let per = Math.floor(100 * loaded / tot);
                        $("#" + $.md5(file[1].name)).css({ "width": per + "%", "transition":"0.2s"}).val(per + "%");
                        console.log("已经上传大小：", loaded, "文件总大小：", tot, "上传百分比：", per);
                    }, false);
                    return xhr;
                }
            },
            success: (ret) => {
                $("#" + $.md5(file[1].name)).val(file[1].name).css({ "width": "70%"});
                // 下载完毕的文件需要将文件从文件的选择列表当中进行移除
                files.delete($.md5(file[1].name));
                console.log(ret);
            }
        });
    }
}

const downloadAllToServer = (files) => {
    for (let file_name of files.values()){   
        $.ajax({
            type: 'POST',
            url: "http://localhost:4040/files/download",
            dataType: "json",
            data: {"file_name": file_name},
            headers:{"auth_code":"jjk"},
            success: (ret) => {
                $("#" + $.md5(file_name)).val(file_name + " √");
                console.log(ret);
                // 需要将下载完成的文件从选中的文件当中进行移除
                files.delete($.md5(file_name))
                // 还需要对选中的文件进行恢复未选中的状态
            }
        });
    }
}