if (typeof descriptors !== 'undefined') {
    for (var i = 0; i < descriptors.length; i++) {
        var descriptor = descriptors[i];
        var options = descriptor.options.map(function(option) {
            var optionText = option.value
            // Special treatment for series options.
            if (descriptor.id === 'SERIES') {
                optionText = option.indicatorId + ' ' + optionText + ' (' + option.key + ')'
            }
            // Special treatment for language options.
            if (descriptor.id === 'LANGUAGE') {
                optionText = option.key
            }
            return {
                id: option.key,
                text: optionText,
            };
        });
        var config = {data: options};
        config.tags = descriptor.id === 'LANGUAGE';
        $('#' + descriptor.id)
            .attr('name', descriptor.id)
            .select2(config);
    }
}
