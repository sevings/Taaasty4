/****************************************************************************
**
** Copyright (C) 2011 Nokia Corporation and/or its subsidiary(-ies).
** All rights reserved.
** Contact: Nokia Corporation (qt-info@nokia.com)
**
** This file is part of the QtDeclarative module of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** In addition, as a special exception, Nokia gives you certain additional
** rights. These rights are described in the Nokia Qt LGPL Exception
** version 1.1, included in the file LGPL_EXCEPTION.txt in this package.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU General
** Public License version 3.0 as published by the Free Software Foundation
** and appearing in the file LICENSE.GPL included in the packaging of this
** file. Please review the following information to ensure the GNU General
** Public License version 3.0 requirements will be met:
** http://www.gnu.org/copyleft/gpl.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Nokia.
**
**
**
**
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 1.1

Rectangle {
    id: page
    width: dialogText.paintedWidth + 50 > window.width ? window.width - 20 : dialogText.paintedWidth + 50
    height: dialogText.height + 50
    color: window.backgroundColor
    border.width: 2
    border.color: 'red'
    opacity: 0
    visible: opacity > 0
    signal opened
    signal closed
    function close() {
        if(page.opacity == 0)
            return; //already closed
        page.closed();
        page.opacity = 0;
    }

    function show(txt) {
        page.opened()
        dialogText.text = txt
        page.opacity = 0.9
    }

    Behavior on opacity {
        NumberAnimation { duration: 300 }
    }

    Text {
        id: dialogText
        anchors.centerIn: parent
        width: window.width - 20
        text: "Hello World!"
        font.pointSize: 32
        wrapMode: Text.WordWrap
        horizontalAlignment: Text.AlignHCenter
        color: window.textColor
    }

    MouseArea {
        anchors.fill: parent
        onClicked: parent.close()
    }
}

