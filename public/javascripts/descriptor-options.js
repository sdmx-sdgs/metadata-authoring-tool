if (typeof descriptors !== 'undefined') {
    for (var i = 0; i < descriptors.length; i++) {
        var descriptor = descriptors[i];
        var options = descriptor.options.map(function(option) {
            return {
                id: option.key,
                text: option.value,
            };
        });
        $('#' + descriptor.id)
            .attr('name', descriptor.id)
            .select2({data: options});
    }
}
