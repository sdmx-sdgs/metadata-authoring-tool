if (Dropzone) {
    Dropzone.options.uploadWidget = {
        addRemoveLinks: true,
        acceptedFiles: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dictDefaultMessage: 'Drop your metadata file (docx) here, or click to browse.',
        dictInvalidFileType: 'This file is not a Word document (docx).',
        init: function() {
            this.on('success', function(file, resp) {
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
