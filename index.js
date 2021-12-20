// show upload/download file list on right
showFileList = function(type){
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
cleanFileList = function(){
    console.log("clean the file list!");
}

cancelAction = function(){
    $("#cancel").on("click", function(){
        $('#file-list').prop("hidden", "hidden");
        enableButton();
        cleanFileList();
    })
}

disableButton = function(type){
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


enableButton = function(type){
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
$('#upload').on('click', function() {
    // first should init an empty file list
    showFileList("upload")
    // mock hidden file input click 
    $("#upload-file").trigger('click');
    // add file to right file list before every times user selected a new file 

    var files = [];
    var index_id = 0
    // $("#upload-file").change(function(e){
        // TODO: add new file to list
        // var fileMsg = e.currentTarget.files;
        var fileMsg = $("#upload-file")[0].files;
        console.log("=====>",fileMsg);
        var fileName = fileMsg[0].name;
        var fileSize = fileMsg[0].size;
        var fileType = fileMsg[0].type;
        files.push({
            fileName: fileName,
            fileSize: fileSize,
            fileType: fileType,
            fileDate: fileMsg[0]
        })
        appendFileToList(fileName, fileSize, fileType, index_id++)

        // console.log(fileName, fileSize, fileType);
    // });
    if (index_id !== 0){
        $("#submit").text("Upload");
    }

})


const appendFileToList = (fileName, fileSize, fileType, fileId) => {
    const item_html = 
        "<div class='file-list-border-wrapper'>" + 
            "<input type='button' "+
                "id='" + fileId + 
                "' value='"+ fileName + ":" + fileSize + " " + fileType + "]" +
                "' class='file-list-border-item' autocomplete='off'>" +
        "</div>"
    $(".file-list-input-wrapper").append(item_html);
}

// Click index download button will do this 
$('#download').on('click', function() {
    // should open an empty file list first
    showFileList("download")
    // then need get file list from remote server

    // change submit button value when all data was loading fish 
    $("#submit").text("Download");
    
})

// This is what will do when click file list element 
$('.file-list-border-item').on('click', function(e){
    const chose_file_item = $(e.target)
    // alert($(e.target).attr( "id" ));
    var css_value = "linear-gradient(to left, rgb(232, 25, 139), rgb(14, 180, 221))"
    alert($(e.target).css("background-image") ==css_value)
    $(e.target).css("background-image") == css_value ?
    $(e.target).css("background-image","") :
    $(e.target).css("background-image", css_value)
})

// submit button will upload file(s) or download file(s)
$('#submit').on('click', function() {
    switch($("#submit").text()){
        case "Submit Upload":
            alert("submit upload file");
            // TODO: Should get right upload file list, and to upload to remote server 
            // should use for of to upload file to reshow loading progress bar
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
    }

    var files = $('#upload-file').prop('files');
    var data = new FormData();
    data.append('file001', files[0]);
    $.ajax({
            type: 'POST',
            url: "http://xxxx/import_csv",
            data: data,
            cache: false,
            processData: false,
            contentType: false,
            success: function (ret) {
                alert(ret);
            }
        });
})

$("#cancel").on("click", function(){
   cancelAction()
})

