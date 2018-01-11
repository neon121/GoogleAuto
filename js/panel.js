$(function() {
    dGet().then(function(data) {
        var inputs = $('input[id]');
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs.eq(i);
            var name = input.attr('id');
            switch (input.attr('type')) {
                case 'text':
                    input.val(data[name]);
                    break;
                case 'checkbox':
                    input.prop('checked', data[name]);
                    break;
            }
        }
        inputs.on('input change', function(e) {
            if (e.type == 'change' && $(this).attr('type') == 'text') return;
            var name = $(this).attr('id');
            switch ($(this).attr('type')) {
                case 'text':     var value = $(this).val();           break;
                case 'checkbox': var value = $(this).prop('checked'); break;
            }
            var obj = {};
            obj[name] = value;
            dSet(obj);
        });
        $('.all').text(data.tasks.length);
        var left = 0;
        var lastMinute = 0;
        for (var i = 0; i < data.tasks.length; i++) {
            var task = data.tasks[i];
            var complete_dt = task.complete_dt;
            if (complete_dt == 0) left++;
            else if (Date.now() - complete_dt < 60) lastMinute++;
            var ready = complete_dt == 0 ? '' : '+';
            var html = "<tr><td>"+task.search_term+"</td><td>"+task.click_url+"</td><td>"+ready+"</td></tr>";
            $('.list tbody').append(html)
        }
        $('.lastMinute').text(lastMinute);
        $('.left').text(left);

        for (var i = 0; i < data.errors.length; i++) {
            $('.errors pre').append(data.errors[i]);
        }
    });
});