//.pragma library

var cashedImages = true;
var bayesEnabled = true;
var minEntryLength = 100;
var bayesModes = ['live', 'anonymous', 'excellent', 'best', 'well', 'good'];

var lastSecondMode = 'none';
var authorId = 0;

function init() {
    API.onError = onError;
    if (bayesEnabled)
        Bayes.load();
}

function parseDate(str) {
    var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/;
    var res = re.exec(str);
    var today = new Date();
    for (var i = 1; i < 4; i++)
        if (res[i].charAt(0) === '0')
            res[i] = res[i].slice(1);
    var date;
    if (today.getMonth()+1 === parseInt(res[2])) {
        if (today.getDate() === parseInt(res[3])) {
            date = 'Сегодня в '+ res[4] + ':' + res[5];
            return date;
        }
        else if (today.getDate()-1 === parseInt(res[3])) {
            date = 'Вчера в '+ res[4] + ':' + res[5];
            return date;
        }
    }
    date = res[3];
    switch (res[2]) {
    case '1':
        date += ' января';
        break;
    case '2':
        date += ' февраля';
        break;
    case '3':
        date += ' марта';
        break;
    case '4':
        date += ' апреля';
        break;
    case '5':
        date += ' мая';
        break;
    case '6':
        date += ' июня';
        break;
    case '7':
        date += ' июля';
        break;
    case '8':
        date += ' августа';
        break;
    case '9':
        date += ' сентябя';
        break;
    case '10':
        date += ' октября';
        break;
    case '11':
        date += ' ноября';
        break;
    case '12':
        date += ' декабря';
        break;
    default:
        date += ' ' + res[2];
        break;
    }
    if (today.getFullYear() !== parseInt(res[1]))
        date += ' ' + res[1];
    return date;
}

function countDays(str) {
    var re = /(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/;
    var res = re.exec(str);
    var days = Math.round((Date.now() - (new Date(res[1], res[2]-1, res[3], res[4], res[5])).valueOf()) / 86400000);
    return days;
}

function onError(text) {
    window.busy--;
    dialog.show(text);
}

function changeMode(newMode) {
    window.mode = newMode;
    header.showMainMenu = false
    header.showProfileMenu = false;
    thisTlog.model.clear();
    thisTlog.currentIndex = 0;
    window.busy = 0;
    window.secondMode = 'none';
    lastSecondMode = 'none';
    window.showNotifs = false;
    window.showSlugInput = false;
    if (window.mode !== 'myFlows' && window.mode !== 'allFlows')
        loadNewEntries(true);
    else {
        fillHeader();
        //if (flowsList.model.count === 0)
            reloadFlows();
    }
}

function subscribe(unsubscribe) {
    header.showProfileMenu = false;
    API.follow(authorId, unsubscribe);
}

function write() {
    header.showProfileMenu = false;
    window.showNotifs = false;
    window.secondMode = 'textEntry'
}

function watchEntry(entry, unwatch) {
    header.showMainMenu = false;
    window.busy++;
    if (unwatch)
        API.removeFromWatching(unwatched, entry)
    else
        API.addToWatching(watched, entry);
}

function watched(entry) {
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry)
        fullEntry.watching = true;
    window.busy--;
}

function unwatched(entry) {
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry)
        fullEntry.watching = false;
    window.busy--;
}

function voteForEntry(unvote) {
    header.showMainMenu = false;
    var entry = thisTlog.model.get(thisTlog.currentIndex);
    if (!unvote && entry.can_vote && !entry.rating.is_voted) {
        window.busy++;
        API.vote(updateRating, entry.id, unvote);
    }

    var bayes = Bayes.voteForEntry(entry, unvote);
    if (bayes !== undefined) {
        thisTlog.model.setProperty(thisTlog.currentIndex, 'bayes', bayes);
        thisTlog.model.setProperty(thisTlog.currentIndex, 'bayes_votable', false);
    }
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry.id)
        fullEntry.bayes_votable = false;
}

function updateRating(entry, rating) {
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry) {
        fullEntry.voted = rating.is_voted;
        fullEntry.votes = rating.votes;
    }
    if (thisTlog.model.get(thisTlog.currentIndex).id === entry) {
        thisTlog.model.setProperty(thisTlog.currentIndex, 'rating', rating);
    }
    window.busy--;
}

function favorites(entry, remove) {
    header.showMainMenu = false;
    window.busy++;
    if (remove)
        API.removeFromFavories(notInFavorites, entry);
    else
        API.addToFavorites(inFavorites, entry);
}

function inFavorites(entry) {
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry)
        fullEntry.favorited = true;
    window.busy--;
}

function notInFavorites(entry) {
    if (window.secondMode === 'fullEntry' && fullEntry.entryId === entry)
        fullEntry.favorited = false;
    window.busy--;
}

function copyUrl(url) {
    console.log('url: ' + url);
    header.showMainMenu = false;
}

function showProfile(slug) {
    window.busy++;
    header.showProfileMenu = false;
    if (slug) {
        API.getTlogInfo(fillProfile, slug);
    }
    else if (window.secondMode === 'profile') {
        closeSecondWindow();
    }
    else if (secondMode === 'fullEntry') {
        API.getTlogInfo(fillProfile, authorId);
    }
    else {
        var entry = thisTlog.model.get(0);
        if (entry !== undefined)
            fillProfile(entry.tlog);
        else
            API.getTlogInfo(fillProfile, authorId);
    }
}

function showMyTlog() {
    changeMode('my');
}
function showSubscribes() {
    changeMode('friends');
}
function showMyFlows() {
    changeMode('myFlows');
}
function showAllFlows() {
    changeMode('allFlows');
}
function showLive() {
    changeMode('live');
}
function showAnonymous() {
    changeMode('anonymous');
}
function showBest() {
    changeMode('best');
}
function showExcellent() {
    changeMode('excellent');
}
function showWell() {
    changeMode('well');
}
function showGood() {
    changeMode('good');
}
function showFavorites() {
    changeMode('favorites');
}
function showTlog() {
    changeMode('tlog');
    while (window.secondMode !== 'none')
        closeSecondWindow();
}
function showTlogById(id) {
    authorId = id;
    console.log(id);
    showTlog();
}
function showTlogBySlug() {
    var slug = slugInput.line;
    if (slug.length === 0)
        return;
    window.showSlugInput = false;
    window.busy++;
    API.getTlogInfo(function(tlog) {
        window.busy--;
        slugInput.clear();
        fillHeader(tlog);
        showTlogById(tlog.id);
    }, slug);
}

function closeSecondWindow() {
    window.secondMode = lastSecondMode;
    lastSecondMode = 'none';
    header.showMainMenu = false;
    if ((window.secondMode === 'none' || window.secondMode === 'fullEntry')
            && thisTlog.model.count > thisTlog.currentIndex)
        fillHeader(thisTlog.model.get(thisTlog.currentIndex).tlog);
}

function fillHeader(tlog) {
    if (((window.mode === 'my' || window.mode === 'tlog') && window.secondMode === 'none')
            || window.secondMode === 'profile' || window.secondMode === 'fullEntry') {
//        authorId = tlog.author.id;
        header.followed = tlog.my_relationship === 'friend';
        header.nick = tlog.author.name;
        header.avatarUrl = tlog.author.hasOwnProperty('userpic') && tlog.author.userpic.hasOwnProperty('thumb64_url')
          ? tlog.author.userpic.thumb64_url : 'http://taaasty.com/assets/userpic/72/29/4409_thumb64.png';
    }
    else {
        header.avatarUrl = 'http://taaasty.com/favicons/favicon-64x64.png';
        //header.avatarUrl = 'http://taaasty.com/favicons/apple-touch-icon-120x120.png';
        if (window.secondMode === 'bayes') {
            if (users.type === 'water')
                header.nick = 'Неинтересные тлоги';
            else if (users.type === 'fire')
                header.nick = 'Интересные тлоги';
        }
        else if (window.secondMode === 'bayesLoad')
            header.nick = 'Загрузка…';
        else if (window.mode === 'friends')
            header.nick = 'Подписки';
        else if (window.mode === 'live')
            header.nick = 'Прямой эфир';
        else if (window.mode === 'myFlows')
            header.nick = 'Мои потоки';
        else if (window.mode === 'allFlows')
            header.nick = 'Все потоки';
        else if (window.mode === 'anonymous')
            header.nick = 'Анонимки';
        else if (window.mode === 'best')
            header.nick = 'Лучшее';
        else if (window.mode === 'excellent')
            header.nick = 'Отлично';
        else if (window.mode === 'well')
            header.nick = 'Хорошо';
        else if (window.mode === 'good')
            header.nick = 'Неплохо';
        else if (window.mode === 'favorites')
            header.nick = 'Избранное';
    }
}

function fillFlows(flows) {
    if (flows !== undefined) {
	flowsList.total = flows.total_count;
        for (var f in flows.items) {
            flowsList.model.append(flows.items[f].flow);
        }
    }
    window.busy--;
}

function loadFlows(first) {
    window.busy++;
    if (window.mode === 'myFlows')
        API.getMyFlows(fillFlows, first === true);
    else
        API.getAllFlows(fillFlows, first === true);
}

function reloadFlows() {
    flowsList.model.clear();
    loadFlows(true);
}

function hidingMode() {
    if (!bayesEnabled)
        return false;
    for (var mode in bayesModes)
        if (window.mode === bayesModes[mode])
            return true;
    return false;
}

function adaptEntry(e) {
    var h = 0;
    var attach = Qt.createQmlObject('import QtQuick 1.1; ListModel { }', window);
        for (var i in e.image_attachments) {
            attach.append(e.image_attachments[i]);
            h += e.image_attachments[i].image.geometry.height / e.image_attachments[i].image.geometry.width;
        }
        if (e.type === 'video') {
            if (e.iframely.links.image !== undefined && e.iframely.links.image[0] !== undefined) {
                var iframely = e.iframely.links.image[0];
                var video = {
                    image: {
                        url: iframely.href,
                        geometry: {
                            height: iframely.media.height,
                            width: iframely.media.width
                        }
                    }
                }
                attach.append(video);
                h += video.image.geometry.height / video.image.geometry.width;
            }
        }

        var entry = e;
        entry.attach = attach;
        entry.wholeHeight = h;
        entry.bayes = Bayes.classify(entry, hidingMode() ? minEntryLength : undefined);
        entry.bayes_votable = !Bayes.isEntryAdded(entry.id);
        if (!entry.hasOwnProperty('text_truncated'))
            entry.text_truncated = (entry.type === 'text' || entry.type === 'anonymous' || entry.type === 'quote' || entry.type === 'image')
                    ? '' : '[' + entry.type + ']'
        if (!entry.hasOwnProperty('text'))
            entry.text = entry.text_truncated;
        if (!entry.hasOwnProperty('title'))
            entry.title = '';
        if (!entry.hasOwnProperty('title_truncated'))
            entry.title_truncated = '';
        return entry;
}

function fillTlog(tlog) {
    if (tlog !== undefined && tlog[0] !== undefined) {
        if (window.secondMode === 'none')
            fillHeader(tlog[0].tlog);
        var found = 0;
        for (var e in tlog) {
            var entry = adaptEntry(tlog[e]);
//            console.log(entry.bayes);
            if (entry.bayes <= 0 && hidingMode())
                continue;
            thisTlog.model.append(entry);
            found++;
        }
        if (!found)
            loadNewEntries();
        console.log((tlog.length - found) + ' hidden');
    }
    window.busy--;
}

function showFullEntry(entry) {
//    console.log(entry.id)
    if (entry.attach === undefined)
        entry = adaptEntry(entry);
    window.busy++;
    fullEntry.title = entry.title;
    fullEntry.content = entry.text;
    fullEntry.type = entry.type;
    fullEntry.date = parseDate(entry.created_at);
    fullEntry.commentsCount = entry.comments_count;
    fullEntry.entryId = entry.id;
    fullEntry.watching = entry.is_watching === true;
    fullEntry.voted = entry.rating.is_voted === true;
    fullEntry.votes = entry.rating.votes;
    fullEntry.voteable = entry.is_voteable === true;
    fullEntry.bayes_votable = !Bayes.isEntryAdded(entry.id);
    fullEntry.canWatch = entry.can_watch === true;
    fullEntry.canVote = entry.can_vote === true;
    fullEntry.canFavorite = entry.can_favorite === true;
    fullEntry.favorited = entry.is_favorited === true;
    fullEntry.url = entry.entry_url;
    fullEntry.wholeHeight = entry.wholeHeight;

    fullEntryAttach.clear();
    if (entry.attach !== undefined) {
        for (var i = 0; i < entry.attach.count; i++)
            fullEntryAttach.append(entry.attach.get(i));

    }
    header.showMainMenu = false;
    window.secondMode = 'fullEntry';
    fillHeader(entry.tlog);

    Bayes.classify(entry);

    fullEntry.model.clear();
    API.getComments(function (comments) {
                        for (var i in comments)
                            fullEntry.model.append(comments[i]);
                        fullEntry.positionViewAtBeginning();
                        window.busy--;
                    }, fullEntry.entryId);
}

function updateComments() {
    window.busy++;
    API.getComments(function (comments) {
                        if (comments !== undefined)
                            fullEntry.commentsCount += comments.length;
                        for (var i in comments)
                            fullEntry.model.append(comments[i]);
                        window.busy--;
                    }, fullEntry.entryId, true);
}

function numStr(n, str1, str234, str5) {
    if (n % 10 === 1 && n % 100 !== 11)
        return n + str1;
    else if ((n % 10 > 1 && n % 10 < 5) && (n % 100 < 10 || n % 100 > 20)) // ????
        return n + str234;
    else
        return n + str5;
}

function fillProfile(tlog) {
    profile.avatarUrl = tlog.author.userpic.hasOwnProperty('large_url')
      ? tlog.author.userpic.large_url : 'http://taaasty.com/assets/userpic/72/29/4409_large.png';
    profile.name = tlog.author.name;
    profile.entries = numStr(tlog.total_entries_count, ' пост', ' поста', ' постов');
    profile.followers = numStr(tlog.relationships_summary.followers_count, ' подписчик', ' подписчика', ' подписчиков');
    profile.followings = numStr(tlog.relationships_summary.followings_count, ' подписка', ' подписки', ' подписок');
    profileModel.clear();
    if (tlog.author.hasOwnProperty('title') && tlog.author.title !== undefined)
        profileModel.append({label: tlog.author.title});
    profileModel.append({label: tlog.author.is_female? 'Девушка' : 'Парень'});
    profileModel.append({label: tlog.author.is_privacy? 'Закрытый тлог' : 'Открытый тлог'});
    profileModel.append({label: numStr( countDays(tlog.created_at), ' день на Тейсти', ' дня на Тейсти', ' дней на Тейсти')});
    if (tlog.my_relationship !== undefined && tlog.my_relationship.length > 0)
        profileModel.append({label: tlog.my_relationship === 'friend' ? 'Я слежу за тлогом' : 'Я не слежу за тлогом' });
    if (tlog.his_relationship !== undefined && tlog.his_relationship.length > 0)
        profileModel.append({label: tlog.his_relationship === 'friend' ? 'Следит за моим тлогом' : 'Не следит за моим тлогом'});
    if (window.secondMode !== 'profile')
        lastSecondMode = window.secondMode;
    window.secondMode = 'profile';
    fillHeader(tlog);
    window.showNotifs = false;
    window.showConvers = false;
    window.busy--;
}

function addComment(comment) {
    if (comment.length > 0) {
        window.busy++;
        API.addComment(function (resp) {
                           fullEntry.commentsCount++;
                           fullEntry.model.append(resp);
                           //thisTlog.model.setProperty(thisTlog.currentIndex, 'comments_count', fullEntry.commentsCount);
                           window.busy--;
                       }, fullEntry.entryId, comment);
    }
}

function addPost() {
    if (titleInput.line.length > 0 || textInput.text.length > 0) {
        var api;
        if (window.mode === 'anonymous')
            api = API.anonymousEntry;
        else if (window.mode !== 'tlog')
            api = API.textEntry;
        if (api !== undefined) {
            window.busy++;
            api(function (entry) {
                    showFullEntry(entry);
                    lastSecondMode = 'none';
                    titleInput.clear();
                    textInput.clear();
                    window.busy--;
                }, titleInput.line, textInput.text);
        }
    }
}

function readAllNotifications() {
    if (!window.showNotifs && window.unreadNotifications)
        API.readNotifications();
    for (var i = 0; i < notifsModel.count; i++) {
        if (notifsModel.get(i).read_at === undefined)
            notifsModel.setProperty(i, 'read_at', new Date().toISOString());
        else
            break;
    }
    window.unreadNotifications = false;
}

function goToNotificationSource(notif) {
    if (notif.entity_type === 'Entry' || notif.entity_type === 'Comment') {
        if (notif.parent_id !== undefined) {
            if (fullEntry.entryId !== notif.parent_id) {
                fullEntry.entryId = notif.parent_id;
                getFullEntry();
            }
            else {
                window.secondMode = 'fullEntry';
                updateComments();
            }
            window.showNotifs = false;
        }
    }
    else if (notif.entity_type === 'Relationship') {
        authorId = notif.sender.id;
        changeMode('tlog');
    }
    else
        console.log(notif.entity_type);
    readAllNotifications();
}

function reloadFeed() {
    thisTlog.model.clear();
    loadNewEntries(true);
}

function showBayesUsers(usersList, adding, type) {
    if (!adding) {
        usersModel.clear();
        if (window.secondMode != 'bayes')
            lastSecondMode = window.secondMode;
        window.secondMode = 'bayes';
        users.type = type;
        fillHeader();
    }
    for (var i in usersList) {
        usersModel.append(usersList[i]);
    }
}

function showUsers(relations, before) {
    if (!before) {
        usersModel.clear();
        lastSecondMode = window.secondMode;
        window.secondMode = 'users';
    }
    for (var i in relations) {
        relations[i]['bayes_include'] = false;
        usersModel.append(relations[i]);
    }
    window.busy--;
}

function loadNewEntries(reload) {
    window.busy++;
    if (window.mode === 'my')
        API.getMyTlog(fillTlog, reload !== true);
    else if (window.mode === 'friends')
        API.getFriendsFeed(fillTlog, reload !== true);
    else if (window.mode === 'live')
        API.getLive(fillTlog, reload !== true);
    else if (window.mode === 'anonymous')
        API.getAnonymous(fillTlog, reload !== true);
    else if (window.mode === 'best')
        API.getBest(fillTlog, reload !== true);
    else if (window.mode === 'excellent')
        API.getExcellent(fillTlog, reload !== true);
    else if (window.mode === 'well')
        API.getWell(fillTlog, reload !== true);
    else if (window.mode === 'good')
        API.getGood(fillTlog, reload !== true);
    else if (window.mode === 'tlog')
        API.getTlog(fillTlog, authorId, reload !== true);
    else if (window.mode === 'favorites')
        API.getFavorites(fillTlog, reload !== true);
}
function getNotifs(before) {
    window.busy++;
    API.getNotifications(function(notifs) {
                             var i;
                             for (i in notifs)
                                 if (notifs[i].read_at === null) {
                                     window.unreadNotifications = true;
                                     break;
                                 }
                             if (before) {
                                 var j = notifsModel.count;
                                 for (i in notifs)
                                     notifsModel.insert(j, notifs[i]);
                             }
                             else
                                 for (i in notifs)
                                     notifsModel.insert(0, notifs[i]);
                             window.busy--;
                         }, before);
}
function getFullEntry() {
    window.busy++;
    API.getEntry(function(entry) {
                     window.busy--;
                     showFullEntry(entry);
                 }, fullEntry.entryId);
}
function getFollowers(before) {
    window.busy++;
    users.type = 'followers';
    API.getFollowers(function(relations) {
                         showUsers(relations, before);
                     }, authorId, before);
}
function getFollowings(before) {
    window.busy++;
    users.type = 'followings';
    API.getFollowings(function(relations) {
                          showUsers(relations, before);
                      }, authorId, before);
}

function getConversations() {
    window.busy++;
    API.getConversations(function(convers) {
                             if (convers === undefined) {
                                 window.busy--;
                                 return;
                             }
                             conversModel.clear();
                             for (var i in convers) {
                                 conversModel.append(convers[i]);
                                 if (convers[i].unread_messages_count > 0)
                                    window.unreadMessages++;
                             }
                             window.busy--;
                         });
}
function showDialog(dialogId, userId, recipientName) {
    console.log('dialog id: ' + dialogId);
    conversation.user = userId;
    conversation.recipientName = recipientName;
    dialogModel.clear();
    window.showDialog = true;
    loadLatestMessages(dialogId);
}
function loadLatestMessages(dialogId) {
    window.busy++;
    API.getMessages(function(messages) {
			if (messages === undefined || messages.length === 0) {
			    window.busy--;
			    return;
			}
                        if (!window.showConvers)
                            window.unreadMessages++;
                        for (var i in messages) {
                            dialogModel.append(messages[i]);
                        }
                        conversation.positionViewAtEnd();
                        window.busy--;
                    }, dialogId, 'latest');
}
function loadPreviousMessages(dialogId) {
    window.busy++;
    API.getMessages(function(messages) {
                        if (messages !== undefined) {
                            for (var i = messages.length - 1; i >= 0; i--)
                                dialogModel.insert(0, messages[i]);
                            conversation.positionViewAtIndex(messages.length, ListView.Beginning);
                        }
                        window.busy--;
                    }, dialogId, 'previous');
}

function sendMessage(text) {
    window.busy++;
    API.sendMessage(function(msg) {
                        dialogModel.append(msg);
                        window.busy--;
                    }, text);
}

function readMessage(msg) {
	API.readMessages(msg);
}
