// import QtQuick 1.0 // to target S60 5th Edition or Maemo 5
import QtQuick 1.1

Rectangle {
    anchors.top: parent.top
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.margins: 10
    height: input.height + 10
    //color: window.backgroundColor
    gradient: Gradient {
        GradientStop { position: 0; color: 'black' }
        GradientStop { position: 1; color: '#292929' }
    }
    border.color: window.textColor
    border.width: 2
    radius: 8
    property string line: input.text
    function clear() {
        input.text = '';
    }
    onFocusChanged: {
        if (focus)
            input.focus = true;
    }
    signal accepted
    TextInput {
        id: input
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.margins: 5
        color: window.textColor
        font.pointSize: 20
        onAccepted: parent.accepted()
    }
}
