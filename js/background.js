/*
data: {
 tasks: [] list of tasks,
 isOn - bool,
 hidden - bool,
 user_id,
 api - server API URL
}

tasks: [
 traffic_id - id
 user_id
 traffic_type
 search_term
 click_url
 wait_seconds
 assigned_dt
 browser_id
 complete_dt
]

AJAX actions:
getTasks - get tasks for user
setCompleteTime - set complete time for task
registerUser - add user to server
 */

try {
    chrome.runtime.onInstalled.addListener(function () { //setting defaultValues (if not set)
        var defaults = {
            isOn: false,
            isHidden: false,
            user_id: "",
            api: "https://myvds.tk/googleAuto/index.php",
            tasks: [],
            errors: []
        };
        dGet().then(function (data) {
            for (var name in defaults) {
                if (data[name] == undefined) data[name] = defaults[name];
            }
            dSet(data);
        });
    });

    //setting alarms
    chrome.alarms.clearAll();
    for (var i = 0; i < 60; i++) {
        chrome.alarms.create(
            'EVERY_SECOND_' + i,
            {
                when: Date.now() + (i + 1) * 1000,
                periodInMinutes: 1
            }
        );
    }
    chrome.alarms.onAlarm.addListener(function () {
        dGet().then(function (data) {
            if (!data.isOn || !data.user_id || !data.api) return;
            if (Math.round(Date.now() / 1000) % 60 == 0) { //get tasks, remove old, once per minute
                if (data.api != "" && data.user_id != "") getTasks(data.user_id, data.api);
                for (var i = 0; i < data.tasks.length; i++) { //remove older than this
                    var complete_dt = data.tasks[i].complete_dt;
                    if (complete_dt > 0 && (Date.now() - complete_dt) / 1000 > 3600) {
                        data.tasks.splice(i, 1);
                        i--;
                    }
                }
                dSet({tasks: data.tasks});
            }
            else {
                if (!googling) {
                    for (var i = 0; i < data.tasks.length; i++) { //googling
                        var task = data.tasks[i];
                        if (!task.complete_dt) {
                            setTaskDone(task.traffic_id);
                            googleIt(task.search_term, task.click_url, task.wait_seconds, data.hidden);
                            break;
                        }
                    }
                }
            }
        });
    });
} catch (e) {
    console.error(e);
    dGet().then(function(data) {
        if (data.errors == undefined) data.errors = [];
        data.errors.push(e);
        dSet({errors: data.errors});
    });
}

function getTasks(user_id, api) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", api, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('user_id=' + encodeURIComponent(user_id) + '&action=getTasks');
    xhr.onreadystatechange = function() {
        if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
            var tasks = JSON.parse(xhr.responseText);
            dGet().then(function (data) {
                var tasksOld = data.tasks; //add only new
                for (var i in tasks) {
                    var task = tasks[i];
                    var alreadyHave = false;
                    for (var j in tasksOld) {
                        var taskOld = tasksOld[j];
                        if (taskOld.traffic_id == task.traffic_id) {
                            alreadyHave = true;
                            break;
                        }
                    }
                    if (!alreadyHave) tasksOld.push({
                        traffic_id: task.traffic_id,
                        search_term: task.search_term,
                        click_url: task.click_url,
                        wait_seconds: task.wait_seconds,
                        traffic_type: task.traffic_type,
                        complete_dt: 0
                    });
                }
                dSet({tasks: tasksOld});
            });
        }
    }
}

function setTaskDone(traffic_id) {
    dGet().then(function(data) {
        for(var i = 0; i < data.tasks.length; i++) {
            if (data.tasks[i].traffic_id == traffic_id) {
                data.tasks[i].complete_dt = Date.now();
                var xhr = new XMLHttpRequest();
                xhr.open("POST", data.api, true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                xhr.send('traffic_id=' + encodeURIComponent(traffic_id) + '&action=setCompleteTime');
                break;
            }
        }
        dSet({tasks: data.tasks});
    })
}