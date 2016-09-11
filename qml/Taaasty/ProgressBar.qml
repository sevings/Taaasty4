import QtQuick 1.1

Item {
    id: progress
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.margins: 10
    height:  label.height + bar.height + 30
    property int value: 0
    property int max: 100
    property string text: ''
    property bool percents: false
    Text {
        id: label
        text: progress.text + (showValue <= progress.max && progress.max > 0 ?
                  ' — ' + (progress.percents ? Math.round(showValue / progress.max * 100) + '%'
                                             : showValue + '/' + progress.max) : '')
        wrapMode: Text.Wrap
        color: window.textColor
        anchors.top: progress.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 10
        font.pointSize: 20
        property int showValue: progress.value
        Behavior on showValue {
            NumberAnimation { duration: 200 }
        }
    }
    Rectangle {
        id: bar
        anchors.left: parent.left
        anchors.top: label.bottom
        anchors.margins: 10
        color: window.brightColor
        radius: 3
        height: 10
        width: progress.value < progress.max
               ? (progress.width - 20) * progress.value / progress.max : (progress.width - 20)
        Behavior on width {
            NumberAnimation { duration: 200 }
        }
    }
}
