.pragma library

var db = openDatabaseSync("taaasty", "1", "Properties and data", 100000);
db.transaction(function(tx) {
//    tx.executeSql("DROP TABLE settings");
   tx.executeSql("CREATE TABLE IF NOT EXISTS settings (key TEXT, value TEXT, PRIMARY KEY(key))");
});

function storeSettingsValue(key, value) {
    db.transaction( function(tx) {
        tx.executeSql("INSERT OR REPLACE INTO settings VALUES (\"" + key + "\", \"" + value + "\")")
    })
}

function readSettingsValue(key) {
    var value = ""
    db.transaction( function(tx) {
        var result = tx.executeSql("SELECT value FROM settings WHERE key=\"" + key + "\"")
        if (result.rows.length === 1) {
            value = result.rows.item(0).value
        }
    })
    return value
}

var baseUrl = 'http://api.taaasty.com:80/v1/';
var access_token;
var expires_at;
var onError;

function apiRequest(onSuccess, url, method, data) {
    if (access_token === undefined) {
        access_token = readSettingsValue('access_token');
        console.log('access token: ' + access_token);
    }
    if (access_token.length === 0) {
        onError('Please authorize')
        //authorize('login@mail', 'password');
    }
    if (method === undefined)
        method = 'GET';
    if (data === undefined)
        data = '';
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
            // Need to wait for the DONE state or you'll get errors
            if (request.readyState === request.DONE) {
                if (Math.floor(request.status/100) === 2) {
                    var result;
                    try {
                        result = JSON.parse(request.responseText);
                    }
                    catch (e) {
                        onError(e.message);
                    }
                    onSuccess(result);
                }
                else {
                    // This is very handy for finding out why your web service won't talk to you
                    console.log('url: ' + url);
                    console.log('method: ' + method);
                    console.log('data: ' + data);
                    console.debug("Status: " + request.status + ", Status Text: " + request.statusText);
                    if (onError !== undefined)
                        onError(request.status + '\n' + request.statusText);
                }
            }
    }
    request.open(method, baseUrl + url, true); // only async supported
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.setRequestHeader("Content-length", data.length);
    request.setRequestHeader('X-User-Token', access_token);
    request.setRequestHeader("Connection", "close");
    request.send(data);
}

function authorize(email, password) {
    var data = 'email=' + email + '&password=' + password;
    var url = 'sessions.json';
    apiRequest(function(user) {
                   access_token = user.api_key.access_token;
                   expires_at = user.api_key.expires_at;
                   console.log(access_token);
                   storeSettingsValue('access_token', user.api_key.access_token);
                   storeSettingsValue('user_id', user.api_key.user_id);
                   storeSettingsValue('expires_at', user.api_key.expires_at);
               }, url, 'POST', data);
}
function getMe(onSuccess) {
    var url = 'users/me.json';
    apiRequest(function (user) {
                   console.log(user.title);
                   onSuccess(user);
               }, url);
}

function getMyTlog(onSuccess, before) {
    var url = 'my_feeds/tlog.json?';
    getFeed('my', onSuccess, url, before);
}

function getFriendsFeed(onSuccess, before) {
    var url = 'my_feeds/friends.json?';
    getFeed('friends', onSuccess, url, before);
}

function getLive(onSuccess, before) {
    //q=
    var url = 'feeds/live.json?';
    getFeed('live', onSuccess, url, before);
}

function getAnonymous(onSuccess, before) {
    var url = 'feeds/anonymous.json?';
    getFeed('anonymous', onSuccess, url, before);
}

function getBest(onSuccess, before) {
    var url = 'feeds/best.json?rating=best&';
    getFeed('best', onSuccess, url, before);
}

function getExcellent(onSuccess, before) {
    var url = 'feeds/best.json?rating=excellent&';
    getFeed('excellent', onSuccess, url, before);
}

function getWell(onSuccess, before) {
    var url = 'feeds/best.json?rating=well&';
    getFeed('well', onSuccess, url, before);
}

function getGood(onSuccess, before) {
    var url = 'feeds/best.json?rating=good&';
    getFeed('good', onSuccess, url, before);
}

function getTlog(onSuccess, slug, before) {
    var url = 'tlog/' + slug + '/entries.json?';
    getFeed('tlog_' + slug, onSuccess, url, before);
}

function getFavorites(onSuccess, before) {
    var url = 'my_feeds/favorites.json?';
    getFeed('favorites', onSuccess, url, before);
}

var latest_entry;
var end_of_feed;
var loading_feed;
var feed_mode;
function getFeed(newMode, onSuccess, url, before) {
    var limit;
    if (feed_mode === newMode && before) {
        if (loading_feed || end_of_feed) {
            onSuccess();
            return;
        }
        limit = 20;
    }
    else {
        latest_entry = undefined;
        limit = 10;
        feed_mode = newMode;
        end_of_feed = false;
    }
    loading_feed = true;
    url += 'limit=' + limit;
    if (before && latest_entry !== undefined)
        url += '&since_entry_id=' + latest_entry;
    apiRequest(function(feed) {
                   if (feed_mode !== newMode) {
                       onSuccess();
                       return;
                   }
                   feed = feed.entries;
                   if (feed.length > 0)
                       latest_entry = feed[feed.length-1].id;
                   if (feed.length === 0)
                       end_of_feed = true;
                   loading_feed = false;
                   onSuccess(feed);
               }, url);
}

var comments_entry;
var latest_comment;
function getComments(onSuccess, entry, before) {
    if (entry !== comments_entry) {
        comments_entry = entry;
        latest_comment = undefined;
    }
    var url = 'comments.json?limit=1000&entry_id=' + entry;
    if (before && latest_comment !== undefined)
        url += '&from_comment_id=' + latest_comment;
    apiRequest(function(comments) {
                   comments = comments.comments;
                   if (comments.length > 0)
                       latest_comment = comments[comments.length-1].id;
                   onSuccess(comments);
               }, url);
}

function addComment(onSuccess, entry, text) {
    var data = 'entry_id=' + entry + '&text=' + text
    var url = 'comments.json';
    apiRequest(function(resp) {
                   latest_comment = resp.id;
                   onSuccess(resp);
               }, url, 'POST', data);
}

var latest_notification;
var earliest_notification;
var notifications_loading = false;
function getNotifications(onSuccess, before) {
    if (notifications_loading){
        onSuccess();
        return;
    }
    notifications_loading = true;
    var url = 'messenger/notifications.json?limit=20';
    if (before && earliest_notification !== undefined)
        url += '&to_notification_id=' + earliest_notification;
    if (!before && latest_notification !== undefined)
        url += '&from_notification_id=' + latest_notification;
    apiRequest(function (nots) {
                   if (nots.notifications.length > 0) {
                       if (before || earliest_notification === undefined)
                           earliest_notification = nots.notifications[0].id;
                       if (!before || latest_notification === undefined)
                           latest_notification = nots.notifications[nots.notifications.length-1].id;
                   }
                   notifications_loading = false;
                   onSuccess(nots.notifications);
               }, url);
}

function readNotifications() {
    var url = 'messenger/notifications/read.json';
    var data = (latest_notification === undefined) ? 'last_id' : 'last_id=' + latest_notification;
    apiRequest(function (nots) {
               }, url, 'POST', data);
}

function getEntry(onSuccess, entry) {
    var url = 'entries/' + entry + '.json';//?include_comments=true';
    apiRequest(function (resp) {
                   onSuccess(resp);
               }, url);
}

function textEntry(onSuccess, title, text, privacy, tlog) {
    var url = 'entries/text.json';
    if (title === undefined)
        title = '';
    if (text === undefined)
        text = '';
    if (privacy === undefined)
        privacy = 'public_with_voting';
    var data = 'title=' + title + '&text=' + text + '&privacy=' + privacy;
    if (tlog !== undefined)
        data += '&tlog_id=' + tlog;
    apiRequest(function(entry) {
                   onSuccess(entry);
    }, url, 'POST', data);

}

function anonymousEntry(onSuccess, title, text) {
    var url = 'entries/anonymous.json';
    if (title === undefined)
        title = '';
    if (text === undefined)
        text = '';
    var data = 'title=' + title + '&text=' + text;
    apiRequest(function(entry) {
                   onSuccess(entry);
    }, url, 'POST', data);
}

function vote(onSuccess, entry, unvote) {
    var method = unvote ? 'DELETE' : 'POST';
    var url = 'entries/' + entry + '/votes.json';
    apiRequest(function (rating) {
                   onSuccess(entry, rating);
               }, url, method);
}

function addToWatching(onSuccess, entry) {
    var method = 'POST';
    var url = 'watching.json';
    var data = 'entry_id=' + entry;
    apiRequest(function (resp) {
                   if (resp.status === 'success') {
                       console.log('added to watching  ' + entry);
                       onSuccess(entry);
                   }
                   else
                       onError('Cannot watching!\nStatus: ' + resp.status);
               }, url, method, data);
}

function removeFromWatching(onSuccess, entry) {
    var method = 'DELETE';
    var url = 'watching.json?entry_id=' + entry;
    apiRequest(function (resp) {
                   if (resp.status === 'success') {
                       console.log('removed from watching  ' + entry);
                       onSuccess(entry);
                   }
                   else
                       onError('Cannot watching!\nStatus: ' + resp.status);
               }, url, method);
}

function addToFavorites(onSuccess, entry) {
    var method = 'POST';
    var url = 'favorites.json';
    var data = 'entry_id=' + entry;
    apiRequest(function (resp) {
                   if (resp.status === 'success') {
                       onSuccess(entry);
                   }
                   else
                       onError('Cannot adding to favorites!\nStatus: ' + resp.status);
               }, url, method, data);
}

function removeFromFavorites(onSuccess, entry) {
    var method = 'DELETE';
    var url = 'favorites.json?entry_id=' + entry;
    apiRequest(function (resp) {
               if (resp.status === 'success') {
                   onSuccess(entry);
               }
               else
                   onError('Cannot removing from favorites!\nStatus: ' + resp.status);
               }, url, method);
}

function follow(slug, unfollow) {
    var url = 'relationships/to/tlog/' + slug + (unfollow ? '/unfollow.json' : '/follow.json');
    apiRequest(function(resp) {
                   console.log('followed ' + slug);
//id:
//user_id:
//reader_id:
//position:
//state: friend
//user: [object Object]

               }, url, 'POST');
}

var users_mode;
var users_tlog_id;
var last_user_id;
var users_loading = false;
var end_of_users = false;
function getUsers(newMode, url, field, onSuccess, slug, before) {
    if (users_mode === newMode) {
        if (users_loading || (end_of_users
                              && slug === users_tlog_id && before)) {
            onSuccess();
            return;
        }
        if (slug === users_tlog_id) {
            if (before && last_user_id !== undefined)
                url += '&since_position=' + last_user_id;
        }
        else {
            last_user_id = undefined;
        }
    }
    else {
        end_of_users = false;
        users_mode = newMode;
    }
    users_tlog_id = slug;
    users_loading = true;
    apiRequest(function(resp) {
                   if (users_mode !== newMode || users_tlog_id !== slug) {
                       onSuccess();
                       return;
                   }
                   var relations = resp.relationships;
                   if (relations.length > 0) {
                       last_user_id = relations[relations.length-1].position;
                   }
                   else
                       end_of_users = true;
                   if (relations.length < 50)
                       end_of_users = true;
                   var followings = [];
                   for (var i in relations)
                       followings[i] = relations[i][field];
                   users_loading = false;
                   onSuccess(followings)
               }, url);
}

function getFollowings(onSuccess, slug, before) {
    var url = 'tlog/' + slug + '/followings.json?limit=50';
    getUsers('followings', url, 'user', onSuccess, slug, before);
}

function getFollowers(onSuccess, slug, before) {
    var url = 'tlog/' + slug + '/followers.json?limit=50';
    getUsers('followers', url, 'reader', onSuccess, slug, before);
}

function getTlogInfo(onSuccess, slug) {
    var url = 'tlog/' + slug + '.json';
    apiRequest(onSuccess, url);
}

var flows_page = 1;
var total_flows_pages = 1;
var flows_loading = false;
var flows_mode;
function getMyFlows(onSuccess, firstPage) {
    var url = 'flows/my.json?';
    getFlowsList(url, 'my', onSuccess, firstPage);
}
function getAllFlows(onSuccess, firstPage) {
    var url = 'flows.json?';
    getFlowsList(url, 'all', onSuccess, firstPage);
}
function getFlowsList(url, newMode, onSuccess, firstPage) {
    if (flows_loading && flows_mode === newMode) {
        onSuccess();
        return;
    }
    flows_loading = true;
    if (firstPage === true || flows_mode !== newMode) {
        flows_page = 1;
        total_flows_pages = 1;
        flows_mode = newMode;
    }
    else
        flows_page++;
    if (flows_page > total_flows_pages) {
        flows_loading = false;
        onSuccess();
        return;
    }
    url += 'limit=20&page=' + flows_page;
    apiRequest(function(resp) {
                   total_flows_pages = resp.total_pages;
                   flows_loading = false;
                   onSuccess(resp);
               }, url);
}

var conversations_loading;
function getConversations(onSuccess) {
    if(conversations_loading) {
        onSuccess();
        return;
    }
    conversations_loading = true;
    var url = 'messenger/conversations.json';
    apiRequest(function(convers) {
                   conversations_loading = false;
                   onSuccess(convers);
               }, url);
}

var messages_loading;
var dialog_id;
var first_message;
var last_message;
var dialog_begin;
var unread_messages;
function getMessages(onSuccess, newDialog, which) {
    if ((newDialog === dialog_id || newDialog === undefined) && which !== 'latest') {
        if (messages_loading || (dialog_begin && which === 'previous')) {
            onSuccess();
            return;
        }
    }
    else if (newDialog !== undefined) {
        first_message = undefined;
        last_message = undefined;
        dialog_begin = false;
        dialog_id = newDialog;
        unread_messages = '';
    }
    messages_loading = true;
    var url = 'messenger/conversations/by_id/' + dialog_id + '/messages.json?limit=20';
    if (which === 'previous' && first_message !== undefined)
        url += '&to_message_id=' + first_message;
    else if (which === 'latest' && last_message !== undefined)
        url += '&from_message_id=' + last_message;
    apiRequest(function(resp) {
                   var messages = resp.messages;
                   if (messages.length > 0) {
                       if (which === 'previous' || first_message === undefined)
                           first_message = messages[0].id;
                       else if (which === 'latest')
                           last_message = messages[messages.length - 1].id;
                   }
                   if (messages.length === 0 && which === 'previous')
                        dialog_begin = true;
                   for (var m in messages)
                        if (messages[m].read_at === undefined || messages[m].read_at === null)
                            if (unread_messages.length === 0)
                                unread_messages = messages[m].id;
                            else
                                unread_messages += ',' + messages[m].id;
                   messages_loading = false;
                   onSuccess(messages);
               }, url);
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function sendMessage(onSuccess, content) {
    var url = 'messenger/conversations/by_id/' + dialog_id + '/messages.json';
    var data = 'content=' + content + '&uuid=' + generateUUID();
    apiRequest(function(msg) {
                    if (msg.conversation_id === dialog_id)
                        last_message = msg.id;
                    onSuccess(msg);
                    readMessages();
               }, url, 'POST', data);
}

function readMessages(msg) {
    var url = 'messenger/conversations/by_id/' + dialog_id +'/messages/read.json'
    var data = 'ids=' + (msg === undefined ? unread_messages : msg);
    apiRequest(function(resp) {
                   console.log('read message status: ' + resp.status);
                   if (msg === undefined)
                       unread_messages = '';
               }, url, 'PUT', data);
}
