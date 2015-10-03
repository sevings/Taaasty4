import QtQuick 1.1

Item {
    id: editor
    anchors.left: parent.left
    anchors.right: parent.right
    height: input.height + 20
    property string message
    signal sent
    TextEditor {
        id: input
        anchors.top: parent.top
        anchors.right: button.left
        height: button.height
    }
    Button {
        id: button
        anchors.top: parent.top
        anchors.left: undefined
        width: parent.width / 5
        //anchors.bottom: parent.bottom
        label: '+'
        onClicked: {
            editor.message = input.text;
            input.clear();
            editor.sent();
        }
    }
}
