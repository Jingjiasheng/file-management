const upload_files = new Map();

const download_files = new Map();

const select_files = new Map();

// show upload/download file list on right
showFileList = (type) => {
    $("#file-list").removeAttr("hidden");
    switch(type){
        case "upload": 
            $(".file-list-header").text("Upload Files")
            disableButton("download");
            break;

        case "download":{
            $(".file-list-header").text("Download Files")
            disableButton("upload");
            // init the data from http response
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
    $('#file-list').prop("hidden", "hidden");
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
        // clear all files after save to local var
        $("#upload-file").val('');
    });
})


const appendFileToList = (input_files) => {
    let item_html;
    // console.log(input_files)
    for (let i =0; i< input_files.length; i++){
        const file = input_files[i]
        // Add every file to upload file list
        upload_files.set(String(file.lastModified), file);
        console.log(typeof file.lastModified);
        // append file to upload file list window
        appendFileToList(file)
        item_html = 
            "<div class='file-list-border-wrapper'>" + 
                "<input type='button' "+
                    "id='" + file.lastModified + 
                    "' value='"+ file.name + ":" + ((file.size) / (1024 * 1000)).toFixed(2) + "M [" + file.type + "]" +
                    "' class='file-list-border-item'>" +
            "</div>"
        $(".file-list-input-wrapper").append(item_html);
    }
    if (upload_files.size > 0){
        $("#submit").text("Upload");
    } else {
        cancelAction()
    }
}

// Click index download button will do this 
$('#download').on('click', () => {
    // should open an empty file list first
    showFileList("download")
    // then need get file list from remote server

    // change submit button value when all data was loading fish 
    $("#submit").text("Download");
    
})

// This is what will do when click file list element 
$('.file-list-input-wrapper').on('click', ".file-list-border-item", (e) => {
    const chose_file_item = $(e.target)
    let file_id = $(e.target).attr( "id" );
    var css_value = "linear-gradient(to left, rgb(232, 25, 139), rgb(14, 180, 221))"
    alert(chose_file_item.css("background-image") == css_value)
    // is already selected
    if (chose_file_item.css("background-image") == css_value){
        chose_file_item.css("background-image","");
        select_files.delete(file_id);
    }else{
        chose_file_item.css("background-image", css_value)
        select_files.set(file_id, file_id);
    }
    console.log("selected file's ids: ", select_files);
})

// remove the items which was selected
$("#del").on("click", () => {
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
})


// submit button will upload file(s) or download file(s)
$('#submit').on('click', () => {
    switch($("#submit").text()){
        case "Submit Upload":
            alert("submit upload file");
            // TODO: Should get right upload file list, and to upload to remote server 
            console.log(upload_files);
            // should use for of to upload file to reshow loading progress bar
            uploadAllToServer(upload_files);
            // should close file list when all file are upload successfully
            $('#file-list').prop("hidden", "hidden");
            break; 
        case "Submit Download":
            alert("Submit download file");
            // TODO: Should need get all file user selected file on right file list window
            // need use for of do those downloads to reshow download pregress bar
            // should close download file list when user down load all files he need
            $('#file-list').prop("hidden", "hidden");
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
        var files = $('#upload-file').prop('files');
        var data = new FormData();
        data.append('file001', files[0]);
        $.ajax({
            type: 'POST',
            url: "http://192.168.10.21:4040/file",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (ret) {
                alert(ret);
            }
        });
    }
}
