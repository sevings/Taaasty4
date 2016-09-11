import QtQuick 1.1
import './TastyAPI.js' as API
import "./Controller.js" as Ctrl

MouseArea {
    id: header
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.top: parent.top
    height: avatar.height
    z: 2
    property string nick
    property bool followed
    property string avatarUrl
    property bool showMainMenu: false
    property bool showProfileMenu: false
    onShowMainMenuChanged: {
        if (showMainMenu) {
            showProfileMenu = false;
            window.showNotifs = false;
            window.showCommentMenu = false;
        }
    }
    onShowProfileMenuChanged: {
        if (showProfileMenu) {
            showMainMenu = false;
            window.showNotifs = false;
            window.showCommentMenu = false;
            window.showConvers = false;
        }
    }
    onClicked: {
        if (window.showSlugInput)
            window.showSlugInput = false;
        else if (window.showNotifs)
            window.showNotifs = false;
        else if (showProfileMenu)
            showProfileMenu = false;
        else if (window.showConvers && !window.showDialog)
            window.showConvers = false;
        else
            showMainMenu = !showMainMenu;
    }
    Rectangle {
        anchors.fill: parent
        //color:  header.backgroundColor
        gradient: Gradient {
            GradientStop { position: 1; color: '#373737' }
            GradientStop { position: 0; color: '#000000' }
        }
        MouseArea {
            id: notifButton
            anchors.right: parent.right
            anchors.top: parent.top
            anchors.bottom: parent.bottom
            width: 96
            onClicked: {
                showProfileMenu = false;
                showMainMenu = false;
                window.showConvers = false;
                if (window.showSlugInput)
                    window.showSlugInput = false;
                else if (!window.showNotifs) {
                    window.showNotifs = true;
                    if (notifsModel.count === 0) {
                        Ctrl.getNotifs();
                        notsTimer.restart();
                    }
                }
                else {
                    window.showNotifs = false;
                    Ctrl.readAllNotifications();
                }
            }
            Notice {
                id: notifNotice
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.bottom
                color: window.unreadNotifications ? window.brightColor : '#575757'
            }
        }
        MouseArea {
            id: conversButton
            anchors.right: notifButton.left
            anchors.top: parent.top
            anchors.bottom: parent.bottom
            width: 96
            onClicked: {
                showProfileMenu = false;
                showMainMenu = false;
                if (window.showSlugInput)
                    window.showSlugInput = false;
                else
                    window.showConvers = !window.showConvers;
                if (window.showConvers && conversModel.count === 0) {
                    Ctrl.getConversations();
                    conversTimer.restart();
                }
            }
            Notice {
                id: conversNotice
                anchors.horizontalCenter: parent.horizontalCenter
                anchors.verticalCenter: parent.bottom
                color: window.unreadMessages > 0 ? window.brightColor : '#575757'
            }
        }
        SmallAvatar {
            id: avatar
            source: avatarUrl
            symbol: avatarUrl.length === 0
            name: header.nick
            onClicked: {
                if (window.showSlugInput)
                    window.showSlugInput = false;
                else
                    showProfileMenu = !showProfileMenu;
            }
        }
        Text {
            id: nick
            text: header.nick
            color: window.textColor
            anchors.left: avatar.right
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter
            anchors.margins: 10
            font.pointSize: 25
            wrapMode: Text.Wrap
            horizontalAlignment: Text.AlignLeft
            elide: Text.ElideRight
        }
    }
}
