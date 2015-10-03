// import QtQuick 1.0 // to target S60 5th Edition or Maemo 5
import QtQuick 1.1

MouseArea {
    id: button
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.margins: 10
    height: 80
    property color textColor: window.textColor
    property color backgroundColor: window.backgroundColor
    property string label
    property int fontSize: 25

    Rectangle {
        anchors.fill: parent
        radius: 10
        //color: button.enabled ? '#333' : backgroundColor
        gradient: Gradient {
            GradientStop { position: 0; color: button.enabled ? '#575757' : '#000000' }
            GradientStop { position: 1; color: button.enabled ? button.containsMouse ? window.brightColor : '#373737' : '#000000' }
        }
        Text {
            id: label
            color: button.textColor
            text: button.label
            anchors.centerIn: parent
            anchors.margins: 20
            verticalAlignment: Text.AlignVCenter
            font.pointSize: button.fontSize
            font.family: 'Open Sans'
        }
    }
}
