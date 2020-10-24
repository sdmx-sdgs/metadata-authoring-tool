if (Dropzone) {
    Dropzone.options.uploadWidget = {
        timeout: 90000,
        acceptedFiles: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-word.document.macroEnabled.12,text/xml,application/xml',
        dictDefaultMessage: 'Drop your metadata file (docx/docm/xml) here, or click to browse.',
        dictInvalidFileType: 'This file is not a Word or SDMX document (docx/docm/xml).',
        init: function() {
            this.on('processing', showProcessingMessage);
            this.on('complete', hideProcessingMessage);
            this.on('success', function(file, resp) {
                if (resp.data.warnings.length) {
                    displayWarnings(resp.data.downloadName, resp.data.warnings);
                }
                axios.get('/download', {
                    responseType: 'blob',
                    params: resp.data,
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', resp.data.downloadName);
                    document.body.appendChild(link);
                    link.click();
                })
            });
        },
    }
}

function displayWarnings(filename, warnings) {
    var heading = document.createElement('H3');
    var headingText = document.createTextNode(filename);
    heading.appendChild(headingText);

    var list = document.createElement('UL');
    for (var i = 0; i < warnings.length; i++) {
        var item = document.createElement('LI');
        var itemText = document.createTextNode(warnings[i]);
        item.appendChild(itemText);
        list.appendChild(item);
    }

    var container = document.getElementById('warnings');
    container.insertBefore(list, container.firstChild);
    container.insertBefore(heading, container.firstChild);
}

function showProcessingMessage() {
    document.getElementById('processing').style.display = 'block';
}

function hideProcessingMessage() {
    document.getElementById('processing').style.display = 'none';
}
