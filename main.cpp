#include <QtGui/QApplication>
#include <QtDeclarative>
#include "qmlapplicationviewer.h"
#include "imagecache.h"

Q_DECL_EXPORT int main(int argc, char *argv[])
{
    QScopedPointer<QApplication> app(createApplication(argc, argv));

    qmlRegisterType<ImageCache>("ImageCache", 1, 0, "ImageCache");

    QmlApplicationViewer viewer;
    viewer.setOrientation(QmlApplicationViewer::ScreenOrientationAuto);
    viewer.setMainQmlFile(QLatin1String("qml/Taaasty/main.qml"));

#if defined(Q_WS_MAEMO_5)
    viewer.showFullScreen();
#else
    viewer.showExpanded();
#endif
    return app->exec();
}
