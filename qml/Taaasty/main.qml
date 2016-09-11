import QtQuick 1.1

import './TastyAPI.js' as API
import "./Controller.js" as Ctrl
import "./Stemmer.js" as Stemmer
import "./Bayes.js" as Bayes

Item {
    id: window
    width: 600
    height: 800
    property color backgroundColor: 'black'
    property color textColor: 'white'
    property color secondaryTextColor: 'darkgrey'
    property color brightColor: '#00DF84'
    property bool unreadNotifications: false
    property int unreadMessages: 0
    property bool showNotifs: false
    property bool showCommentMenu: false
    property bool showSlugInput: false
    property bool showConvers: false
    property bool showDialog: false
    property string mode: 'my'
    property string secondMode: 'none'
    property int busy: 0
    Component.onCompleted: {
        Ctrl.init();
//        API.authorize('binque@ya.ru', '296010tasty');
        Ctrl.loadNewEntries();
//        var words = [];
//        var text = 'наиважнейший <a href="http://ya.ru/bb/kk.html"> < img src = \'http://ya.ru/img.jpeg\' >'
//        Bayes.addText(text, words);
//        for (var i in words)
//            console.log(words[i], i);
    }
    Component.onDestruction: {
        Bayes.store();
    }

    onBusyChanged: {
        //console.log('busy: ' + busy);
        if (busy < 0)
            busy = 0;
    }
    onShowNotifsChanged: {
        if (showNotifs) {
            header.showMainMenu = false;
            header.showProfileMenu = false;
            showCommentMenu = false;
        }
    }
    Timer {
        id: notsTimer
        interval: 20000
        running: true
        repeat: true
        //triggeredOnStart: true
        onTriggered: Ctrl.getNotifs()
    }
    Timer {
        id: conversTimer
        interval: 300000
        running: true
        repeat: true
        //triggeredOnStart: true
        onTriggered: Ctrl.getConversations()
    }
    Timer {
        id: dialogTimer
        interval: 20000
        running: window.showDialog
        repeat: true
        onTriggered: Ctrl.loadLatestMessages()
    }

    Rectangle {
        id: bar
        anchors.top: parent.top
        width: parent.width / 5
        height: 5
        color: window.textColor
        x: 0
        z: 1000
        visible: window.busy > 0
        SequentialAnimation {
            running: window.busy > 0
            loops: Animation.Infinite
            NumberAnimation {
                target: bar
                property: 'x'
                from: 0
                to: window.width * 0.8
                duration: 500
            }
            NumberAnimation {
                target: bar
                property: 'x'
                from: window.width * 0.8
                to: 0
                duration: 500
            }
        }
    }

    Header {
        id: header
        z: 10
    }

    Flickable {
        id: mainMenu
        anchors.top: header.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        boundsBehavior: Flickable.StopAtBounds
        z: header.z-1
        visible: header.showMainMenu || header.showProfileMenu || window.showCommentMenu
        contentHeight: mainMenuColumn.height + 20
        Rectangle {
            anchors.fill: parent
            color: window.backgroundColor
        }
        Column {
            id: mainMenuColumn
            anchors.left: parent.left
            anchors.right: parent.right
            spacing: 5
            y: 10
            Button {
                id: myButton
                label: 'Мой тлог'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showMyTlog()
            }
            Button {
                id: friendsButton
                label: 'Подписки'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showSubscribes()
            }
            Button {
                id: myFlowsButton
                label: 'Мои потоки'
                visible: window.secondMode === 'none'
                         && (header.showMainMenu || header.showProfileMenu
                             && (window.mode === 'myFlows' || window.mode === 'allFlows')) && !window.showConvers
                onClicked: Ctrl.showMyFlows()
            }
            Button {
                id: allFlowsButton
                label: 'Все потоки'
                visible: window.secondMode === 'none' && header.showProfileMenu
                             && (window.mode === 'myFlows' || window.mode === 'allFlows') && !window.showConvers
                onClicked: Ctrl.showAllFlows()
            }
            Button {
                id: liveButton
                label: 'Прямой эфир'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showLive()
            }
            Button {
                id: anonymousButton
                label: 'Анонимки'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showAnonymous()
            }
            Button {
                id: bestButton
                label: 'Лучшее'
                visible: (header.showMainMenu || header.showProfileMenu
                          && (window.mode === 'best' || window.mode === 'excellent'
                              || window.mode === 'well' || window.mode === 'good'))
                         && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showBest()
            }
            Button {
                id: excellentButton
                label: 'Отлично'
                visible:  (window.mode === 'best' || window.mode === 'excellent'
                           || window.mode === 'well' || window.mode === 'good')
                          && header.showProfileMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showExcellent()
            }
            Button {
                id: wellButton
                label: 'Хорошо'
                visible: (window.mode === 'best' || window.mode === 'excellent'
                          || window.mode === 'well' || window.mode === 'good')
                         && header.showProfileMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showWell()
            }
            Button {
                id: goodButton
                label: 'Неплохо'
                visible: (window.mode === 'best' || window.mode === 'excellent'
                          || window.mode === 'well' || window.mode === 'good')
                         && header.showProfileMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showGood()
            }
            Button {
                id: favButton
                label: 'Избранное'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Ctrl.showFavorites();
            }
            Button {
                id: showSlugInputButton
                label: 'Перейти в тлог'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: {
                    header.showMainMenu = false;
                    window.showSlugInput = true;
                    slugInput.focus = true;
                }
            }
            Button {
                id: bayesButton
                label: 'Классификатор'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers && Ctrl.bayesEnabled
                onClicked: {
                    header.showMainMenu = false;
                    Bayes.showFire();
                }
            }
            Button {
                id: exitButton
                label: 'Выход'
                visible: header.showMainMenu && window.secondMode === 'none' && !window.showConvers
                onClicked: Qt.quit()
            }

            Button {
                id: writeButton
                visible: header.showProfileMenu && (window.mode === 'my' || window.mode === 'anonymous')
                         && !window.showConvers
                label: 'Написать'
                onClicked: Ctrl.write()
            }
            Button {
                id: subscribeButton
                visible: header.showProfileMenu && window.mode === 'tlog' && !window.showConvers
                label: header.followed ? 'Отписаться' : 'Подписаться'
                onClicked: Ctrl.subscribe(header.followed)
            }
            Button {
                id: profileButton
                label: 'Профиль'
                visible:  (window.mode === 'my' || window.mode === 'tlog'
                           || ((window.secondMode === 'fullEntry'  || window.secondMode === 'profile')
                               && window.mode !== 'anonymous')) && header.showProfileMenu && !window.showConvers
                onClicked: Ctrl.showProfile()
            }
            Button {
                id: fireTlogButton
                label: 'Интересный тлог'
                visible:  (window.mode === 'my' || window.mode === 'tlog'
                           || ((window.secondMode === 'fullEntry'  || window.secondMode === 'profile')
                               && window.mode !== 'anonymous')) && header.showProfileMenu && !window.showConvers
                          && !Bayes.isTlogAdded(Ctrl.authorId, true) && Ctrl.bayesEnabled
                onClicked:  {
                    header.showProfileMenu = false;
                    Bayes.voteForTlog(Ctrl.authorId);
                }
            }
            Button {
                id: waterTlogButton
                label: 'Неинтересный тлог'
                visible:  (window.mode === 'my' || window.mode === 'tlog'
                           || ((window.secondMode === 'fullEntry'  || window.secondMode === 'profile')
                               && window.mode !== 'anonymous')) && header.showProfileMenu && !window.showConvers
                          && !Bayes.isTlogAdded(Ctrl.authorId, true) && Ctrl.bayesEnabled
                onClicked:  {
                    header.showProfileMenu = false;
                    Bayes.voteForTlog(Ctrl.authorId, true);
                }
            }

            Button {
                id: readTlogButton
                visible: header.showMainMenu && window.secondMode === 'fullEntry' && fullEntry.type !== 'anonymous'
                         || window.showCommentMenu && !window.showConvers
                label: 'Читать тлог'
                onClicked: Ctrl.showTlog()
            }
            Button {
                id: urlButton
                label: 'Ссылка'
                visible: header.showMainMenu && window.secondMode === 'fullEntry' && !window.showConvers
                onClicked: Ctrl.copyUrl(fullEntry.url)
            }

            Button {
                id: sendEntryButton
                label: 'Отправить'
                visible: header.showMainMenu && window.secondMode === 'textEntry' && !window.showConvers
                onClicked: Ctrl.addPost()
            }

            Button {
                id: bayesFireButton
                label: 'Интересные'
                visible: header.showMainMenu && window.secondMode === 'bayes' && !window.showConvers
                         && Ctrl.bayesEnabled
                onClicked: {
                    header.showMainMenu = false;
                    Bayes.showFire();
                }
            }
            Button {
                id: bayesWaterButton
                label: 'Неинтересные'
                visible: header.showMainMenu && window.secondMode === 'bayes' && !window.showConvers
                         && Ctrl.bayesEnabled
                onClicked: {
                    header.showMainMenu = false;
                    Bayes.showWater();
                }
            }
            Button {
                id: bayesTrainButton
                label: 'Тренировать'
                visible: header.showMainMenu && window.secondMode === 'bayes' && !window.showConvers
                         && Ctrl.bayesEnabled
                onClicked: {
                    header.showMainMenu = false;
                    Bayes.train();
                }
            }

            Button {
                id: closeButton
                label: 'Закрыть'
                visible: header.showMainMenu && window.secondMode !== 'none' && !window.showConvers
                onClicked: Ctrl.closeSecondWindow()
            }

            Button {
                id: closeDialogButton
                label: 'К списку диалогов'
                visible: header.showMainMenu && window.showConvers && window.showDialog
                onClicked: {
                    window.showDialog = false;
                    header.showMainMenu = false;
                }
            }
        }
        MouseArea {
            anchors.top: mainMenuColumn.bottom
            anchors.left: parent.left
            anchors.right: parent.right
            height: window.height - header.height - mainMenuColumn.height
            visible: height > 0
            onClicked: {
                header.showMainMenu = false;
                header.showProfileMenu = false;
                showCommentMenu = false;
            }
        }
    }

    Rectangle {
        color: backgroundColor
        anchors.top: header.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom

        MyListView {
            id: thisTlog
            model: ListModel {}
            spacing: 50
            visible: window.mode !== 'flows' && window.secondMode === 'none' && !window.showNotifs && !window.showConvers
            endHeight: 5
            onAboveBegin: Ctrl.reloadFeed();
            onNearEnd: Ctrl.loadNewEntries();
            delegate: Rectangle {
                id: entry
                anchors.left: parent.left
                anchors.right: parent.right
                color: window.backgroundColor
                property color fontColor: window.textColor
                height: 50 + content.height + entryTitle.height + images.height + entryAvatar.height + comments.height
                property int bayes_rating: bayes
                Behavior on bayes_rating {
                    NumberAnimation { duration: 300 }
                }
                MouseArea {
                    anchors.fill: parent
                    onClicked: {
                        var ix =  parent.x + mouseX;
                        var iy =  parent.y + mouseY;
                        thisTlog.currentIndex = thisTlog.indexAt(ix, iy);
                        Ctrl.showFullEntry(thisTlog.model.get(thisTlog.currentIndex));
                    }
                }
                SmallAvatar {
                    id: entryAvatar
                    anchors.margins: 10
                    source: !symbol ? author.userpic.thumb64_url : ''
                    name: author.name
                    symbol: !author.userpic.hasOwnProperty('thumb64_url')
                    onClicked: Ctrl.showProfile(author.id)
                }
                Text {
                    id: nick
                    text: author.name
                    color: entry.fontColor
                    font.pointSize: 20
                    anchors.top: parent.top
                    anchors.left: entryAvatar.right
                    anchors.right: entryVoteButton.left
                    anchors.margins: 10
                    elide: Text.AlignRight
                    horizontalAlignment: Text.AlignLeft
                }
                Text {
                    id: date
                    text: Ctrl.parseDate(created_at)
                    color: window.secondaryTextColor
                    font.pointSize: 14
                    anchors.top: nick.bottom
                    anchors.left: entryAvatar.right
                    anchors.margins: 10
                }
                function updateRating(eid, newRating) {
                    rating.votes = newRating.votes
                    rating.is_voted = newRating.is_voted;
                    entryVoteButton.label = '+ ' + newRating.votes;
                    entryVoteButton.enabled = can_vote && !newRating.is_voted;
                }
                Button {
                    id: entryBayesButton
                    label: enabled ? '—' : ''
                    fontSize: 14
                    enabled: bayes_votable && Ctrl.bayesEnabled
                    anchors.bottom: entryVoteButton.bottom
                    anchors.left: undefined
                    anchors.right: entryBayesText.left
                    anchors.bottomMargin: 0
                    height: entryVoteButton.height * 2 / 3
                    width: entryVoteButton.width * 2 / 3
                    onClicked: {
                        var ix =  parent.x + mouseX;
                        var iy =  parent.y + mouseY;
                        thisTlog.currentIndex = thisTlog.indexAt(ix, iy);
                        Ctrl.voteForEntry(true);
                    }
                }
                Text {
                    id : entryBayesText
                    visible: Ctrl.bayesEnabled
                    text: entry.bayes_rating
                    font.pointSize: 14
                    color: window.textColor
                    anchors.verticalCenter: entryBayesButton.verticalCenter
                    anchors.right: entryVoteButton.left
                    //anchors.left: entryBayesButton.right
                    anchors.margins: 10
                }
                Button {
                    id: entryVoteButton
                    anchors.top: parent.top
                    anchors.left: undefined
                    height: 64
                    width: parent.width / 5
                    label: is_voteable ? '+ ' + rating.votes : '+'
                    visible: is_voteable || (bayes_votable && Ctrl.bayesEnabled)
                    enabled: (bayes_votable && Ctrl.bayesEnabled) || (can_vote && !rating.is_voted)
                    fontSize: 20
                    onClicked: {
                        var ix =  parent.x + mouseX;
                        var iy =  parent.y + mouseY;
                        thisTlog.currentIndex = thisTlog.indexAt(ix, iy);
                        Ctrl.voteForEntry(false);
                    }
                }

                ImagesView {
                    id: images
                    anchors.top: entryAvatar.bottom
                    model: attach
                    height: wholeHeight * width
                }
                Text {
                    id: entryTitle
                    text: title_truncated
                    anchors.top: images.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                    font.family: tlog.design.feedFont
                    font.pointSize: text_truncated.length > 0 ? 25 : 20
                    color: parent.fontColor
                    textFormat: Text.RichText
                    height: title_truncated.length > 0 ? paintedHeight : text_truncated.length > 0 ? -20 : 0
                }
                Text {
                    id: content
                    text: text_truncated
                    anchors.top: entryTitle.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                    font.family: tlog.design.feedFont
                    font.pointSize: 20
                    color: parent.fontColor
                    textFormat: Text.RichText
                    height: text_truncated.length > 0 ? paintedHeight : title_truncated.length > 0 ? -20 : 0
                }
                Text {
                    id: comments
                    text: comments_count + ' коммент.'
                    color: entry.fontColor
                    font.pointSize: 15
                    anchors.top: content.bottom
                    anchors.right: parent.right
                    anchors.margins: 10
                }
            }
        }

        MyListView {
            id: flowsList
            visible: (window.mode === 'myFlows' || window.mode === 'allFlows')
                     && window.secondMode === 'none' && !window.showNotifs && !window.showConvers
            model: ListModel {}
            spacing: 50
            property int total
            onNearEnd:  Ctrl.loadFlows();
            onAboveBegin: Ctrl.reloadFlows();
            header: Item {
                anchors.left: parent.left
                anchors.right: parent.right
                height: flowsCountText.paintedHeight + 80
                Text {
                id: flowsCountText
                    anchors.left: parent.left
                    anchors.right: parent.right
                anchors.verticalCenter: parent.verticalCenter
                    font.pointSize: 25
                    wrapMode: Text.Wrap
                    horizontalAlignment: Text.AlignHCenter
                    color: window.textColor
                    text: Ctrl.numStr(flowsList.total, ' поток', ' потока', ' потоков')
                }
            }
            delegate: Rectangle {
                //id: flow
                anchors.left: parent.left
                anchors.right: parent.right
                color: window.backgroundColor
                height: flowPicture.height + flowName.height + flowTitle.height + flowFollowers.height + 40
                MouseArea {
                    anchors.fill: parent
                    onClicked: Ctrl.showTlogById(id)
                }
                MyImage {
                    id: flowPicture
                    anchors.top: parent.top
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.bottomMargin: 10
                    source: flowpic.original_url
                    width: window.width
                    height: width * 10 / 16
                    fillMode: Image.PreserveAspectCrop
                }
                Text {
                    id: flowName
                    text: name
                    color: window.textColor
                    font.pointSize: 25
                    anchors.top: flowPicture.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                }
                Text {
                    id: flowTitle
                    text: title === undefined ? '' : title
                    color: window.textColor
                    font.pointSize: 20
                    anchors.top: flowName.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                    height: text.length === 0 ? 0 : paintedHeight
                }
                Text {
                    id: flowFollowers
                    text: Ctrl.numStr(followers_count, ' подписчик', ' подписчика', ' подписчиков')
                    color: window.secondaryTextColor
                    font.pointSize: 15
                    anchors.top: flowTitle.bottom
                    anchors.right: parent.right
                    anchors.margins: 10
                }
                Text {
                    id: flowPosts
                    text: Ctrl.numStr(public_tlog_entries_count, ' запись', ' записи', ' записей')
                    color: window.secondaryTextColor
                    font.pointSize: 15
                    anchors.top: flowTitle.bottom
                    anchors.left: parent.left
                    anchors.margins: 10
                }
            }
        }

        MyListView {
            id: fullEntry
            visible: window.secondMode === 'fullEntry' && !window.showNotifs && !window.showConvers
            property string commentAuthor
            property string title: ''
            property string content: ''
            property string type
            property bool watching
            property bool voted
            property int votes
            property bool voteable
            property bool bayes_votable
            property bool canVote
            property bool canWatch
            property bool canFavorite
            property bool favorited
            property string url
            property int entryId
            property string date
            property int commentsCount
            property double wholeHeight
            ListModel {
                id: fullEntryAttach
            }
            model: ListModel { }
            delegate: Item {
                anchors.left: parent.left
                anchors.right: parent.right
                //color: window.backgroundColor
                height: 40 + commentText.paintedHeight + nameText.paintedHeight
                SmallAvatar {
                    id: commentAvatar
                    anchors.margins: 10
                    width: 64
                    height: 64
                    source: !symbol ? user.userpic.thumb64_url : ''
                    name: user.name
                    symbol: !user.userpic.hasOwnProperty('thumb64_url')
                    onClicked: Ctrl.showProfile(user.id)
                }
                Text {
                    id: nameText
                    text: user.name
                    color: window.textColor
                    anchors.top: parent.top
                    anchors.left: commentAvatar.right
                    anchors.right: commentDate.left
                    anchors.leftMargin: 10
                    anchors.rightMargin: 10
                    wrapMode: Text.Wrap
                    font.pointSize: 20
                    font.bold: true
                    style: Text.Raised
                    styleColor: window.brightColor
                }
                Text {
                    id: commentDate
                    text: Ctrl.parseDate(updated_at)
                    color: window.secondaryTextColor
                    anchors.baseline: nameText.baseline
                    anchors.right: parent.right
                    anchors.leftMargin: 10
                    anchors.rightMargin: 10
                    font.pointSize: 15
                }
                Text {
                    id: commentText
                    text: comment_html
                    color: window.textColor
                    anchors.rightMargin: 10
                    anchors.top: nameText.bottom
                    anchors.left: nameText.left
                    anchors.right: parent.right
                    wrapMode: Text.Wrap
                    font.pointSize: 17
                    textFormat: Text.RichText
                }
//                MouseArea {
//                    anchors.fill: parent
//                    onClicked: {
//                        fullEntry.commentAuthor = user.name;
//                        //window.showCommentMenu = true;
//                    }
//                }
            }
            header: Item {
                id: fullEntryContent
                anchors.left: parent.left
                anchors.right: parent.right
                height: fullTitle.height + fullContent.height + 90 + fullEntryImages.height + fullEntryFavButton.height + fullEntryDate.height
                ImagesView {
                    id: fullEntryImages
                    model: fullEntryAttach
                    height: fullEntry.wholeHeight * width
                    anchors.top: parent.top
                }
                Text {
                    id: fullTitle
                    text: fullEntry.title
                    anchors.top: fullEntryImages.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                    font.pointSize: fullEntry.content.length > 0 ? 25 : 20
                    color: window.textColor
                    textFormat: Text.RichText
                    height: fullEntry.title.length > 0 ? paintedHeight : fullEntry.content.length > 0 ? -20 : 0
                }
                Text {
                    id: fullContent
                    text: fullEntry.content
                    anchors.top: fullTitle.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    wrapMode: Text.Wrap
                    font.pointSize: 20
                    color: window.textColor
                    textFormat: Text.RichText
                    height: fullEntry.content.length > 0 ? paintedHeight : fullEntry.title.length > 0 ? -20 : 0
                }
                Text {
                    id: fullEntryDate
                    text: fullEntry.date
                    color: window.secondaryTextColor
                    anchors.top: fullContent.bottom
                    anchors.left: parent.left
                    anchors.margins: 10
                    font.pointSize: 15
                }
                Text {
                    id: fullEntryCommentsCount
                    text: fullEntry.commentsCount + ' коммент.'
                    color: window.secondaryTextColor
                    anchors.top: fullContent.bottom
                    anchors.right: parent.right
                    anchors.margins: 10
                    font.pointSize: 15
                }
                Button {
                    id: fullEntryFavButton
                    anchors.top: fullEntryDate.bottom
                    anchors.right: undefined
                    anchors.margins: 10
                    anchors.topMargin: 20
                    label: '*'
                    height: 64
                    width: (parent.width - 40) / 3
                    fontSize: 20
                    visible: fullEntry.canFavorite
                    enabled: !fullEntry.favorited
                    onClicked: Ctrl.favorites(fullEntry.entryId)
                }
                Button {
                    id: fullEntryWatchButton
                    anchors.top: fullEntryDate.bottom
                    anchors.left: fullEntryFavButton.right
                    anchors.right: undefined
                    anchors.margins: 10
                    anchors.topMargin: 20
                    label: 'V'
                    height: 64
                    width: fullEntryFavButton.width
                    fontSize: fullEntryFavButton.fontSize
                    visible: fullEntry.canWatch // http delete?
                    enabled: !fullEntry.watching
                    onClicked: Ctrl.watchEntry(fullEntry.entryId, fullEntry.watching)
                }
                Button {
                    id: fullEntryVoteButton
                    anchors.top: fullEntryDate.bottom
                    anchors.left: fullEntryWatchButton.right
                    anchors.margins: 10
                    anchors.topMargin: 20
                    label: fullEntry.voteable ? '+ ' + fullEntry.votes : '+'
                    height: 64
                    fontSize: fullEntryFavButton.fontSize
                    visible: (fullEntry.bayes_votable && Ctrl.bayesEnabled) || fullEntry.voteable
                    enabled: (fullEntry.bayes_votable && Ctrl.bayesEnabled) || (fullEntry.canVote && !fullEntry.voted) // not working on the site?
                    onClicked: Ctrl.voteForEntry(fullEntry.voted)
                }
            }
            footer: MessageEditor {
                id: commentEditor
                onSent: {
                    Ctrl.addComment(commentEditor.message);
                }
            }
        }

        Item {
            id: textEntry
            anchors.fill: parent
            visible: window.secondMode === 'textEntry' && !window.showNotifs && !window.showConvers
            LineInput {
                id: titleInput
            }
            TextEditor {
                id: textInput
                anchors.top: titleInput.bottom
                anchors.bottom: formatButtons.top
            }
            Row {
                id: formatButtons
                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                anchors.margins: 10
                spacing: 5
                Button {
                    id: italic
                    anchors.left: undefined
                    anchors.right: undefined
                    width: (parent.width - 5 * 3) / 4
                    height: 64
                    label: '<i>I</i>'
                    onClicked: textInput.insertTags('<i>', '</i>')
                }
                Button {
                    anchors.left: undefined
                    anchors.right: undefined
                    width: italic.width
                    height: italic.height
                    label: '<b>B</b>'
                    onClicked: textInput.insertTags('<b>', '</b>')
                }
                Button {
                    anchors.left: undefined
                    anchors.right: undefined
                    width: italic.width
                    height: italic.height
                    label: '<u>U</u>'
                    onClicked: textInput.insertTags('<u>', '</u>')
                }
                Button {
                    anchors.left: undefined
                    anchors.right: undefined
                    width: italic.width
                    height: italic.height
                    label: 'http'
                    onClicked: textInput.insertTags('<a href=\"', '\"></a>')
                }
            }

        }

        MyListView {
            id: notifsView
            anchors.fill: parent
            visible: window.showNotifs
            model:  ListModel {
                id: notifsModel
            }
            spacing: 20
            onNearEnd: Ctrl.getNotifs(true);
            delegate: MouseArea {
                id: notif
                anchors.left: parent.left
                anchors.right: parent.right
                height: notifName.paintedHeight + notifText.paintedHeight + 20
                property string content: text
                onClicked: {
                    var ix =  x + mouseX;
                    var iy =  y + mouseY;
                    Ctrl.goToNotificationSource(notifsModel.get(notifsView.indexAt(ix, iy)));
                }
                SmallAvatar {
                    id: notifAvatar
                    anchors.margins: 10
                    source: !symbol ? sender.userpic.thumb64_url : ''
                    name: sender.name
                    symbol: !sender.userpic.hasOwnProperty('thumb64_url')
                    onClicked: Ctrl.showProfile(sender.id);
                }
                Text {
                    id: notifName
                    text: '<b>' + sender.name + '</b> ' + action_text
                    color: window.textColor
                    anchors.top: parent.top
                    anchors.left: notifAvatar.right
                    anchors.right: unreadNotice.left
                    anchors.leftMargin: 10
                    anchors.rightMargin: 10
                    wrapMode: Text.Wrap
                    font.pointSize: 18
                    style: Text.Raised
                    styleColor: 'lightblue'
                }
                Notice {
                    id: unreadNotice
                    anchors.verticalCenter: notifName.verticalCenter
                    anchors.right: parent.right
                    anchors.margins: 20
                    color: window.brightColor
                    visible: read_at === undefined || read_at === null
                }
                Text {
                    id: notifText
                    text: parent.content
                    color: window.textColor
                    anchors.rightMargin: 10
                    anchors.top: notifName.bottom
                    anchors.left: notifName.left
                    anchors.right: parent.right
                    wrapMode: Text.Wrap
                    font.pointSize: 17
                }
            }
        }

        MyListView {
            id: profile
            visible: window.secondMode === 'profile' && !window.showNotifs && !window.showConvers
            property int tlogId: 0
            property string avatarUrl
            property string name
            property string followers
            property string followings
            property string entries
            ListModel {
                id: profileModel
            }
            spacing: 10
            model: profileModel
            delegate: Text {
                anchors.left: parent.left
                anchors.right: parent.right
                font.pointSize: 25
                wrapMode: Text.Wrap
                horizontalAlignment: Text.AlignHCenter
                color: window.textColor
                text: label === undefined ? '' : label
                //visible: text.length > 0
                height: text.length > 0 ? paintedHeight : 0
            }
            header: Item {
                anchors.left: parent.left
                anchors.right: parent.right
                height: bigAvatar.height + name.height + 30
                MyImage {
                    id: bigAvatar
                    anchors.top: parent.top
                    anchors.topMargin: 20
                    anchors.bottomMargin: 20
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: width
                    source: profile.avatarUrl
                }
                Text {
                    id: name
                    anchors.top: bigAvatar.bottom
                    anchors.left: parent.left
                    anchors.right: parent.right
                    anchors.margins: 10
                    font.pointSize: 35
                    wrapMode: Text.Wrap
                    horizontalAlignment: Text.AlignHCenter
                    color: window.textColor
                    text: profile.name
                }
            }
            footer: Item {
                height: profileFooterColumn.height + 20
                anchors.left: parent.left
                anchors.right: parent.right
                Column {
                    id: profileFooterColumn
                    anchors.left: parent.left
                    anchors.right: parent.right
                    y: 10
                    spacing: 5
                    Button {
                        id: showTlogButton
                        label: profile.entries
                        onClicked: Ctrl.showTlog()
                    }
                    Button {
                        id: followersButton
                        label: profile.followers
                        onClicked: Ctrl.getFollowers()
                    }
                    Button {
                        id: followingsBitton
                        label: profile.followings
                        onClicked: Ctrl.getFollowings()
                    }
                }
            }
        }

        MyListView {
            id: users
            visible: (window.secondMode === 'users' || window.secondMode === 'bayes') && !window.showNotifs && !window.showConvers
            property string title: 'Подписки'
            property string type: 'followings'
            onTypeChanged: {
                if (type === 'followers')
                    title = 'Подписчики';
                else if (type === 'followings')
                    title = 'Подписки';
                else if (type === 'fire')
                    title = 'Интересные тлоги';
                else if (type === 'water')
                    title = 'Неинтересные тлоги';
            }
            model: ListModel {
                id: usersModel
            }
            onNearEnd: {
                if (users.type === 'followings')
                    Ctrl.getFollowings(true);
                else if (users.type === 'followers')
                    Ctrl.getFollowers(true);
            }
            delegate: Rectangle {
                anchors.left: parent.left
                anchors.right: parent.right
                height: usersAvatar.height + 20
                color: usersMouse.pressed ? window.brightColor : window.backgroundColor
                //property int userid: user.id
                SmallAvatar {
                    id: usersAvatar
                    anchors.top: undefined
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.margins: 10
                    source: !symbol ? userpic.thumb64_url : ''
                    name: name
                    symbol: !userpic.hasOwnProperty('thumb64_url')
                    onClicked: Ctrl.showProfile(id)
                }
                MouseArea {
                    id: usersMouse
//                    anchors.fill: parent
                    anchors.left: usersAvatar.right
                    anchors.right: parent.right
                    anchors.top: parent.top
                    anchors.bottom: parent.bottom
                    onClicked: {
                        if (window.secondMode === 'bayes')
                            Bayes.toggleInclude(users.type, id);
                        else
                            Ctrl.showTlogById(id);
                    }
                    Text {
                        id: usersName
                        font.pointSize: 25
                        color: (window.secondMode === 'bayes' && !bayes_include) ? '#808080' : window.textColor
                        text: name
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.left: parent.left
                        anchors.leftMargin: 10
                        anchors.rightMargin: 10
                        elide: Text.ElideRight
                    }
                }
            }
            header: Item {
                anchors.left: parent.left
                anchors.right: parent.right
                height: usersTitle.paintedHeight + 20
                Text {
                    id: usersTitle
                    font.pointSize: 25
                    color: window.textColor
                    text: users.title
                    anchors.centerIn: parent
                    y: 10
                }
            }
            footer: Item {
                anchors.left: parent.left
                anchors.right: parent.right
                height: usersAdd.visible ? usersAdd.height : 0
                MessageEditor {
                    id: usersAdd
                    visible: window.secondMode === 'bayes'
                    onSent: Bayes.addTlog(users.type, usersAdd.message.trim());
                }
            }
        }

        Item {
            id: bayesLoad
            visible: window.secondMode === 'bayesLoad'
            anchors.verticalCenter: parent.verticalCenter
            anchors.left: parent.left
            anchors.right: parent.right
            height: tlogBar.height + allBar.height + 30
            property bool fullLoad: true
            ProgressBar {
                id: tlogBar
                anchors.top: parent.top
                text: 'tlog'
                value: 0
                max: 0
            }
            ProgressBar {
                id: allBar
                visible: bayesLoad.fullLoad
                anchors.top: tlogBar.bottom
                text: 'Всего'
                value: 0
                max: 0
                percents: true
            }
        }

        Item {
            anchors.fill: parent
            visible: window.showConvers && !window.showNotifs
            MyListView {
                id: convers
                visible: !window.showDialog
                model: ListModel {
                    id: conversModel
                }
                onAboveBegin: Ctrl.getConversations()
                delegate: Rectangle {
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: conversAvatar.height + 20
                    color: conversMouse.pressed ? window.brightColor : window.backgroundColor
                    MouseArea {
                        id: conversMouse
                        anchors.fill: parent
                        onClicked: Ctrl.showDialog(id, user_id, recipient.name);
                    }
                    SmallAvatar {
                        id: conversAvatar
                        anchors.top: undefined
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.margins: 10
                        source: !symbol ? recipient.userpic.thumb64_url : ''
                        name: recipient.name
                        symbol: !recipient.userpic.hasOwnProperty('thumb64_url')
                        onClicked: Ctrl.showProfile(recipient.id);
                    }
                    Text {
                        id: conversName
                        font.pointSize: 20
                        color: window.textColor
                        text: recipient.name
                        anchors.left: conversAvatar.right
                        anchors.right: parent.right
                        anchors.top: parent.top
                        anchors.margins: 10
                        elide: Text.ElideRight
                    }
                    Text {
                        id: lastMessage
                        font.pointSize: 15
                        color: window.secondaryTextColor
                        text: last_message !== undefined ? last_message.content_html : ''
                        anchors.left: conversAvatar.right
                        anchors.right: parent.right
                        anchors.bottom: parent.bottom
                        anchors.margins: 10
                        elide: Text.ElideRight
                    }
                    Notice {
                        id: unreadMessagesNotice
                        anchors.verticalCenter: parent.verticalCenter
                        anchors.right: parent.right
                        anchors.margins: 20
                        color: window.brightColor
                        visible: unread_messages_count > 0
                    }
                }
            }
            MyListView {
                id: conversation
                visible: window.showDialog
                property int user
                property string recipientName
                property bool unread: false
                onAboveBegin: Ctrl.loadPreviousMessages()
                spacing: 30
                model: ListModel {
                    id: dialogModel
                }
                delegate: Rectangle {
                    anchors.left: parent.left
                    anchors.right: parent.right
                    height: messageName.paintedHeight + messageText.paintedHeight + 30
                    color: user_id === conversation.user ? '#373737' : window.backgroundColor
                    Text {
                        id: messageName
                        text: user_id === conversation.user ? 'Вы' : conversation.recipientName
                        color: window.textColor
                        anchors.top: parent.top
                        anchors.left: parent.left
                        anchors.right: messageDate.left
                        anchors.margins: 10
                        wrapMode: Text.Wrap
                        font.pointSize: 20
                        font.bold: true
                        style: Text.Raised
                        styleColor: window.brightColor
                    }
                    Text {
                        id: messageDate
                        text: Ctrl.parseDate(created_at)
                        color: window.secondaryTextColor
                        anchors.baseline: messageName.baseline
                        anchors.right: parent.right
                        anchors.margins: 10
                        font.pointSize: 15
                    }
                    Text {
                        id: messageText
                        text: content_html
                        color: window.textColor
                        anchors.top: messageName.bottom
                        anchors.left: parent.left
                        anchors.right: parent.right
                        anchors.margins: 10
                        wrapMode: Text.Wrap
                        font.pointSize: 17
                        textFormat: Text.RichText
                    }
                    Notice {
                        id: unreadMessage
                        anchors.verticalCenter: messageName.verticalCenter
                        anchors.right: messageDate.left
                        anchors.margins: 20
                        color: window.brightColor
                        visible: read_at === undefined || read_at === null
                    }
                    MouseArea {
                        visible: unreadMessage.visible
                        anchors.fill: parent
                        onClicked: {
                            Ctrl.readMessage(id);
                            unreadMessage.visible = false;
                        }
                    }
                }
                footer: MessageEditor {
                    id: messageEditor
                    onSent: {
                        Ctrl.sendMessage(messageEditor.message)
                    }
                }
            }
        }
    }
    MouseArea {
        anchors.fill: parent
        visible: window.showSlugInput
        onClicked: window.showSlugInput = false
        Rectangle {
            id: goToTlog
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            height: goToTlogButton.height + 20
            color: window.backgroundColor
            radius: 10
            LineInput {
                id: slugInput
                anchors.top: undefined
                anchors.right: goToTlogButton.left
                anchors.verticalCenter: parent.verticalCenter
                onAccepted: Ctrl.showTlogBySlug()
            }
            Button {
                id: goToTlogButton
                label: '>>'
                anchors.left: undefined
                anchors.verticalCenter: parent.verticalCenter
                width: parent.width / 5
                onClicked: Ctrl.showTlogBySlug()
            }
        }
    }

    Dialog {
        id: dialog
        anchors.centerIn: parent
        z: 1000
    }
}


