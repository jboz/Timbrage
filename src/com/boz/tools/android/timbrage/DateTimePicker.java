package com.boz.tools.android.timbrage;

import org.joda.time.LocalDateTime;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.Dialog;
import android.os.Build;
import android.view.Gravity;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup.LayoutParams;
import android.view.Window;
import android.widget.Button;
import android.widget.DatePicker;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TimePicker;
import android.widget.ViewSwitcher;

public class DateTimePicker implements OnClickListener {
    private DatePicker datePicker;
    private TimePicker timePicker;
    private ViewSwitcher viewSwitcher;

    private final int SET_DATE = 100, SET_TIME = 101, SET = 102, CANCEL = 103;

    private Button btn_setDate, btn_setTime, btn_set, btn_cancel;

    private LocalDateTime dateTime = null;

    private final Activity activity;

    private ICustomDateTimeListener listener = null;

    private final Dialog dialog;

    private boolean is24HourView = true;

    public DateTimePicker(final Activity a, final ICustomDateTimeListener customDateTimeListener) {
        activity = a;
        listener = customDateTimeListener;

        dialog = new Dialog(activity);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        final View dialogView = getDateTimePickerLayout();
        dialog.setContentView(dialogView);
    }

    public void setDateTime(final LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }

    @SuppressWarnings("deprecation")
    private int matchForNew() {
        if (android.os.Build.VERSION.SDK_INT >= 10) {
            return LayoutParams.MATCH_PARENT;
        }
        return LayoutParams.FILL_PARENT;
    }

    @TargetApi(Build.VERSION_CODES.HONEYCOMB)
    public View getDateTimePickerLayout() {
        final LinearLayout.LayoutParams linear_match_wrap = new LinearLayout.LayoutParams(matchForNew(), matchForNew());
        final LinearLayout.LayoutParams linear_wrap_wrap = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,
                LayoutParams.WRAP_CONTENT);
        final FrameLayout.LayoutParams frame_match_wrap = new FrameLayout.LayoutParams(matchForNew(),
                LayoutParams.WRAP_CONTENT);

        final LinearLayout.LayoutParams button_params = new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT,
                1.0f);

        final LinearLayout linear_main = new LinearLayout(activity);
        linear_main.setLayoutParams(linear_match_wrap);
        linear_main.setOrientation(LinearLayout.VERTICAL);
        linear_main.setGravity(Gravity.CENTER);

        final LinearLayout linear_child = new LinearLayout(activity);
        linear_child.setLayoutParams(linear_wrap_wrap);
        linear_child.setOrientation(LinearLayout.VERTICAL);

        final LinearLayout linear_top = new LinearLayout(activity);
        linear_top.setLayoutParams(linear_match_wrap);

        btn_setDate = new Button(activity);
        btn_setDate.setLayoutParams(button_params);
        btn_setDate.setText("Set Date");
        btn_setDate.setId(SET_DATE);
        btn_setDate.setOnClickListener(this);

        btn_setTime = new Button(activity);
        btn_setTime.setLayoutParams(button_params);
        btn_setTime.setText("Set Time");
        btn_setTime.setId(SET_TIME);
        btn_setTime.setOnClickListener(this);

        linear_top.addView(btn_setDate);
        linear_top.addView(btn_setTime);

        viewSwitcher = new ViewSwitcher(activity);
        viewSwitcher.setLayoutParams(frame_match_wrap);

        datePicker = new DatePicker(activity);
        int currentapiVersion = android.os.Build.VERSION.SDK_INT;
        if (currentapiVersion >= 11) {
            datePicker.setCalendarViewShown(false);
        }
        timePicker = new TimePicker(activity);

        viewSwitcher.addView(timePicker);
        viewSwitcher.addView(datePicker);

        final LinearLayout linear_bottom = new LinearLayout(activity);
        linear_match_wrap.topMargin = 8;
        linear_bottom.setLayoutParams(linear_match_wrap);

        btn_set = new Button(activity);
        btn_set.setLayoutParams(button_params);
        btn_set.setText("Set");
        btn_set.setId(SET);
        btn_set.setOnClickListener(this);

        btn_cancel = new Button(activity);
        btn_cancel.setLayoutParams(button_params);
        btn_cancel.setText("Cancel");
        btn_cancel.setId(CANCEL);
        btn_cancel.setOnClickListener(this);

        linear_bottom.addView(btn_set);
        linear_bottom.addView(btn_cancel);

        linear_child.addView(linear_top);
        linear_child.addView(viewSwitcher);
        linear_child.addView(linear_bottom);

        linear_main.addView(linear_child);

        return linear_main;
    }

    public void showDialog() {
        if (!dialog.isShowing()) {
            if (dateTime == null) {
                dateTime = LocalDateTime.now();
            }

            timePicker.setIs24HourView(is24HourView);
            timePicker.setCurrentHour(dateTime.getHourOfDay());
            timePicker.setCurrentMinute(dateTime.getMinuteOfHour());

            datePicker.updateDate(dateTime.getYear(), dateTime.getMonthOfYear() - 1, dateTime.getDayOfMonth());

            dialog.show();

            btn_setDate.performClick();
        }
    }

    public void dismissDialog() {
        if (!dialog.isShowing()) {
            dialog.dismiss();
        }
    }

    public void set24HourFormat(final boolean is24HourFormat) {
        is24HourView = is24HourFormat;
    }

    public static interface ICustomDateTimeListener {
        public void onSet(final LocalDateTime dateTime);

        public void onCancel();
    }

    public void onClick(final View v) {
        switch (v.getId()) {
            case SET_DATE:
                btn_setTime.setEnabled(true);
                btn_setDate.setEnabled(false);
                viewSwitcher.showNext();
                break;

            case SET_TIME:
                btn_setTime.setEnabled(false);
                btn_setDate.setEnabled(true);
                viewSwitcher.showPrevious();
                break;

            case SET:
                if (dialog.isShowing()) {
                    dialog.dismiss();
                }
                if (listener != null) {
                    final int month = datePicker.getMonth();
                    final int year = datePicker.getYear();
                    final int day = datePicker.getDayOfMonth();
                    final int hourOfDay = timePicker.getCurrentHour().intValue();
                    final int minute = timePicker.getCurrentMinute().intValue();

                    dateTime = new LocalDateTime(year, month + 1, day, hourOfDay, minute);

                    listener.onSet(dateTime);
                }
                resetData();
                break;

            case CANCEL:
                if (dialog.isShowing()) {
                    dialog.dismiss();
                }
                if (listener != null) {
                    listener.onCancel();
                }
                resetData();
                break;
        }
    }

    private void resetData() {
        dateTime = null;
        is24HourView = true;
    }
}