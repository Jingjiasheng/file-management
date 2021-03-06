const upload_files = new Map();

const download_files = new Map();

const select_files = new Map();

// show upload/download file list on right
showFileList = (type) => {
    $("#file-list").show(500);
    $("#cancel").text("CLOSE");
    switch (type) {
        case "upload":
            $(".file-list-header").text("Upload Files");
            // disableButton("download");
            $("#submit").text("Upload");
            break;

        case "download": {
            $(".file-list-input-wrapper").empty();
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

$("#cancel").on("click", function () {
    // close file list if text is close
    // reset auth_code if text is exit
    if ($("#cancel").text() == "Close") {
        cancelAction();
    }
    if ($("#cancel").text() == "Exit") {
        localStorage.removeItem("auth_code");
        window.location.reload ()
    }
})

cancelAction = () => {
    $('#file-list').hide(500);
    enableButton();
    cleanFileList();
    $("#submit").text("Submit");
    $("#cancel").text("Exit");
}

disableButton = (type) => {
    switch (type) {
        case "upload":
            $('#upload').attr('disabled', true);
            $('#upload').css('color', "rgb(0, 0, 0)");
            break;
        case "download":
            $('#download').attr('disabled', true);
            $('#download').css('color', "rgb(0, 0, 0)");
    }
}


enableButton = (type) => {
    switch (type) {
        case "upload":
            $('#upload').css('disabled', false);
            $('#upload').css('color', "rgb(255, 255, 255)");
            break;
        case "download":
            $('#upload').css('disabled', false);
            $('#download').css('color', "rgb(255, 255, 255)");
            break;
        default:
            $('#upload').css('disabled', false);
            $('#upload').css('color', "rgb(255, 255, 255)");
            $('#upload').css('disabled', false);
            $('#download').css('color', "rgb(255, 255, 255)");
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
    $("#upload-file").change(function (e) {
        showFileList("upload")
        appendFileToList(e.currentTarget.files)
        // clear all files after save to local let
        $("#upload-file").val('');
    });
})


const appendFileToList = (input_files) => {
    let item_html;
    for (let i = 0; i < input_files.length; i++) {
        const file = input_files[i]
        // Add every file to upload file list
        if ($(".file-list-header").text() == "Upload Files") {
            upload_files.set($.md5(file.name), file);
        }
        // append file to upload file list window
        appendFileToList(file)
        item_html =
            "<div class='file-list-border-wrapper'>" +
            "<input type='button' " +
            "id='" + $.md5(file.name) +
            "' value='" + file.name +
            "' class='file-list-border-item'>" +
            "<label name=" + $.md5(file.name) + " style='font-size: 13px; text-align: center; margin-left: 5px'>" + `${(file.size > 1000 * 1024) ?
                ((file.size) / (1024 * 1000)).toFixed(2) + " MB" : ((file.size) / (1 * 1000)).toFixed(2) + " KB"}` +
            "</label>" +
            "</div>"
        $(".file-list-input-wrapper").append(item_html);
    }
    if (upload_files.size < 0) {
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
        url: "./files/get_list",
        dataType: "json",
        headers: { "auth_code": localStorage.getItem("auth_code") },
        success: (res) => {
            console.log(res);
            appendFileToList(res.data.file_list.map(file => ({
                name: file.file_name,
                size: file.size
            })))
            toptips(res);
        },
        error: (error) => {
            toptips(error.responseJSON, 3);
            console.log(error);
        }
    });
    // change submit button value when all data was loading fish 


})

// This is what will do when click file list element 
$('.file-list-input-wrapper').on('click', ".file-list-border-item", (e) => {
    const chose_file_item = $(e.target)
    let file_id = $(e.target).attr("id");
    let css_value = "linear-gradient(to left, rgb(232, 25, 139), rgb(14, 180, 221))"
    if (chose_file_item.css("background-image") == css_value) {
        chose_file_item.css("background-image", "");
        select_files.delete(file_id);
    } else {
        chose_file_item.css("background-image", css_value)
        select_files.set(file_id, $(e.target).attr("value"));
    }
})

// remove the items which was selected
$("#del").on("click", () => {
    switch ($(".file-list-header").text()) {
        case "Upload Files":
            for (let file_id of select_files.keys()) {
                $("#" + file_id).parent().remove();
                if ($("#submit").text() === "Upload") {
                    upload_files.delete(file_id);
                }
                select_files.delete(file_id);
            }
            if (upload_files.size === 0) {
                cancelAction()
            }
            break;
        case "Download Files":
            const file_names = [];
            select_files.forEach((value, key) => { file_names.push(value) });
            $.ajax({
                type: 'POST',
                url: "./files/delete",
                dataType: "json",
                data: { "file_names": file_names },
                headers: { "auth_code": localStorage.getItem("auth_code") },
                success: (ret) => {
                    for (file_id of select_files.keys()) {
                        // ????????????????????????
                        $("#" + file_id).parent().remove();
                        // ????????????????????????????????????
                        select_files.delete(file_id);
                        $("#download").trigger('click');
                    }
                    console.log(ret);
                    toptips(ret);
                }
            });
            break
        default:
            break;
    }
})


// submit button will upload file(s) or download file(s)
$('#submit').on('click', () => {
    switch ($("#submit").text()) {
        case "Upload":
            // TODO: Should get right upload file list, and to upload to remote server 
            // should use for of to upload file to reshow loading progress bar
            uploadAllToServer(upload_files);
            // should close file list when all file are upload successfully

            break;
        case "Download":
            // TODO: Should need get all file user selected file on right file list window
            select_files.forEach((value, key) => { download_files.set(key, value) })
            // need use for of do those downloads to reshow download pregress bar
            downloadAllToServer(download_files);
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
    for (let file of files) {
        var data = new FormData();
        data.append("file", file[1]);
        data.append("auth_code", "jjk");
        $.ajax({
            type: 'POST',
            url: "./files/upload",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            headers: { "auth_code": localStorage.getItem("auth_code") },
            xhr: () => {
                let xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener("progress", (event) => {
                        //????????????????????????
                        let loaded = event.loaded;
                        // ??????????????? 
                        let tot = event.total;
                        // ???????????????
                        let per = Math.floor(100 * loaded / tot);
                        $("#" + $.md5(file[1].name)).css({ "width": per + "%", "transition": "0.2s" }).val(per + "%");
                        console.log("?????????????????????", loaded, "??????????????????", tot, "??????????????????", per);
                    }, false);
                    return xhr;
                }
            },
            success: (ret) => {
                $("#" + $.md5(file[1].name)).val(file[1].name).css({ "width": "70%" });
                // ??????????????????????????????????????????????????????????????????????????????
                files.delete($.md5(file[1].name));
                toptips(ret);
                console.log(ret);
            },
            error: (error) => {
                toptips(error.responseJSON, 3);
                console.log(error);
            }
        });
    }
}

const downloadAllToServer = (files) => {
    for (let file_name of files.values()) {
        downLoadByUrl("./files/download/", file_name);
    }
}

downLoadByUrl = (url, file_name) => {
    var xhr = new XMLHttpRequest();
    //GET??????,????????????url,async(????????????)
    xhr.open('GET', url + "?file_name=" + file_name, true);
    //??????????????????????????????,?????????????????????????????????
    xhr.setRequestHeader("auth_code", localStorage.getItem("auth_code"));
    // set listener 
    xhr.addEventListener("progress", function (evt) {
        if (evt.lengthComputable) {
            var per = Math.floor((evt.loaded / evt.total)* 100) ;
            console.log(per);
            // $("#progressing").html(per + "%");
            $("#" + $.md5(file_name)).css({ "width": per + "%", "transition": "0.2s" }).val(per + "%");
        }
    }, false);
    //????????????????????? blob
    xhr.responseType = 'blob';
    //????????????
    xhr.onload = function (e) {
        //????????????????????????
        if (this.status == 200) {

            $("#" + $.md5(file_name)).val(file_name + " ???").css({ "width": "70%" });
            // ??????????????????????????????????????????????????????????????????
            download_files.delete($.md5(file_name))
            // ?????????????????????????????????????????????????????????

            var blob = this.response;
            var filename = file_name;//???123.xls
            var a = document.createElement('a');

            blob.type = "application/octet-stream";
            //????????????url??????
            var url = URL.createObjectURL(blob);

            a.href = url;
            a.download = filename;
            a.click();
            //?????????????????????URL??????
            window.URL.revokeObjectURL(url);
        }
    };
    //????????????
    xhr.send();
}

//???????????? default close time unit: sec
toptips = (res, time = 1) => {
    // const time = 1000;
    const text = res.message;

    switch (Math.floor(res.code / 1e3)) {
        case 200:
            $('.toptips').css({ 'background': '#06ae56' }).text(text).fadeIn("200")
            break;
        case 400:
            $('.toptips').css({ 'background': '#ffc300' }).text(text).fadeIn("200")
            break;
        case 403:
            $('.toptips').css({ 'background': '#00947e' }).text(text).fadeIn("200")
            break;
        case 500:
            $('.toptips').css({ 'background': '#fa5151' }).text(text).fadeIn("200")
            break;
        default:
            //   $('.toptips').css({'background': '#06ae56'}).text(text).fadeIn("200")
            $('.toptips').css({ 'background': '#fa5151' }).text('Error:toptips() ????????????').fadeIn("200")
            break;
    }
    $('body').css({ 'pointer-events': 'none' })
    close(time * 1000)
}
// ??????????????????
close = (time) => {
    setTimeout(() => {
        $('body').removeAttr('style', '')
        $('.toptips').fadeOut("200")
    }, time)
}