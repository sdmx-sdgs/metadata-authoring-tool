if (Dropzone) {
    Dropzone.options.uploadWidget = {
        addRemoveLinks: true,
        acceptedFiles: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        dictDefaultMessage: 'Drop your metadata file (docx) here, or click to browse.',
        dictInvalidFileType: 'This file is not a Word document (docx).',
    }
}
