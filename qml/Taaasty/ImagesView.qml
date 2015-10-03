// import QtQuick 1.0 // to target S60 5th Edition or Maemo 5
import QtQuick 1.1

ListView {
    id: images
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.topMargin: 10
    anchors.bottomMargin: 10
    interactive: false
    //spacing: 10
    delegate: MyImage {
        id: picture
        anchors.topMargin: 10
        anchors.bottomMargin: 10
        source: image.url
        height: image.geometry.height / (image.geometry.width / window.width)
        width: window.width
//        onStatusChanged: {
////            if (status === Image.Loading)
////                window.busy++;
////            else //if (status === Image.Ready || status === Image.Error)
////                window.busy--;
//        }
    }
}
