import "expo-router/entry";
import {
    registerWidgetConfigurationScreen,
    registerWidgetTaskHandler,
} from "react-native-android-widget";
import { widgetTaskHandler } from "./src/widgets/widget-task-handler";
import { WidgetConfigurationScreen } from "./src/widgets/WidgetConfigurationScreen";
import "./src/notifications/todayNotification";

registerWidgetTaskHandler(widgetTaskHandler);
registerWidgetConfigurationScreen(WidgetConfigurationScreen);
