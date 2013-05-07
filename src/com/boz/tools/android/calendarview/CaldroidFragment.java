package com.boz.tools.android.calendarview;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.joda.time.LocalDate;
import org.joda.time.Period;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.support.v4.app.DialogFragment;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.GridView;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.boz.tools.android.timbrage.R;
import com.boz.tools.android.timbrage.TimeReport;

/**
 * Caldroid is a fragment that display calendar with dates in a month. Caldroid
 * can be used as embedded fragment, or as dialog fragment.
 * Caldroid fragment includes 4 main parts:
 * 1) Month title view: show the month and year (e.g MARCH, 2013)
 * 2) Navigation arrows: to navigate to next month or previous month
 * 3) Weekday gridview: contains only 1 row and 7 columns. To display
 * "SUN, MON, TUE, WED, THU, FRI, SAT"
 * 4) Dates gridview: contains dates within a month, and any dates in previous/
 * next month. This dates gridview is main component of this library.
 * Caldroid fragment supports setting min/max date, selecting dates in a range,
 * setting disabled dates, highlighting today. It includes convenient methods to
 * work with date and string, enable or disable the navigation arrows.
 * Caldroid code is simple and clean partly because of powerful JODA DateTime
 * library!
 * 
 * @author thomasdao
 */

@SuppressLint("DefaultLocale")
public class CaldroidFragment extends DialogFragment {

    public static int selectedTextColor = Color.BLACK;
    public static int disabledTextColor = Color.GRAY;

    /**
     * Caldroid view components
     */
    private Button leftArrowButton;
    private Button rightArrowButton;
    private TextView monthTitleTextView;
    private GridView weekdayGridView;
    private GridView datesGridView;

    /**
     * Adapter to dates gridview
     */
    private CaldroidGridAdapter datesGridAdapter;

    /**
     * Initial data
     */
    protected int month = -1;
    protected int year = -1;
    protected boolean showNavigationArrows = true;

    /**
     * For Listener
     */
    private OnItemClickListener dateItemClickListener;
    private CaldroidListener caldroidListener;

    private TextView textReportMonthlyH;
    private TextView textReportMonthlyM;
    private TextView textReportMonthlyS;
    private LinearLayout reportLayout;

    /**
     * Return the adapter of the dates gridview
     * 
     * @return
     */
    public CaldroidGridAdapter getDatesGridAdapter() {
        return datesGridAdapter;
    }

    /**
     * Meant to be subclassed. User who wants to provide custom view,
     * need to provide custom adapter here
     */
    public CaldroidGridAdapter getNewDatesGridAdapter() {
        return new CaldroidGridAdapter(getActivity(), month, year);
    }

    /**
     * For client to customize the date gridview
     * 
     * @return
     */
    public GridView getDatesGridView() {
        return datesGridView;
    }

    /**
     * For client to customize the weekDayGridView
     * 
     * @return
     */
    public GridView getWeekdayGridView() {
        return weekdayGridView;
    }

    /**
     * Set calendar to previous month
     */
    private void prevMonth() {
        DateTime dateTime = new DateTime(year, month, 1, 0, 0);
        dateTime = dateTime.minusMonths(1);
        month = dateTime.getMonthOfYear();
        year = dateTime.getYear();
        refreshView();
    }

    /**
     * Set calendar to next month
     */
    private void nextMonth() {
        DateTime dateTime = new DateTime(year, month, 1, 0, 0);
        dateTime = dateTime.plusMonths(1);
        month = dateTime.getMonthOfYear();
        year = dateTime.getYear();
        refreshView();
    }

    /**
     * Check if the navigation arrow is shown
     * 
     * @return
     */
    public boolean isShowNavigationArrows() {
        return showNavigationArrows;
    }

    /**
     * Show or hide the navigation arrows
     * 
     * @param showNavigationArrows
     */
    public void setShowNavigationArrows(boolean showNavigationArrows) {
        this.showNavigationArrows = showNavigationArrows;
        if (showNavigationArrows) {
            leftArrowButton.setVisibility(View.VISIBLE);
            rightArrowButton.setVisibility(View.VISIBLE);
        } else {
            leftArrowButton.setVisibility(View.INVISIBLE);
            rightArrowButton.setVisibility(View.INVISIBLE);
        }
    }

    /**
     * Set caldroid listener when user click on a date
     * 
     * @param caldroidListener
     */
    public void setCaldroidListener(CaldroidListener caldroidListener) {
        this.caldroidListener = caldroidListener;
    }

    /**
     * Callback to listener when date is valid (not disable, not outside of
     * min/max date)
     * 
     * @return
     */
    private OnItemClickListener getDateItemClickListener() {
        final List<LocalDate> dateTimes = CalendarHelper.getFullWeeks(month, year);
        dateItemClickListener = new OnItemClickListener() {
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                final LocalDate dateTime = dateTimes.get(position);

                if (caldroidListener != null) {
                    caldroidListener.onSelectDate(dateTime.toDate(), view);
                }
            }

        };
        return dateItemClickListener;
    }

    private LocalDate getDate() {
        return LocalDate.now().withMonthOfYear(month).withYear(year);
    }

    /**
     * Refresh view when parameter changes. You should always change all
     * parameters first, then call this method.
     */
    public void refreshView() {
        monthTitleTextView.setText(getDate().monthOfYear().getAsText().toUpperCase() + " " + year);
        datesGridAdapter = getNewDatesGridAdapter();

        datesGridView.setAdapter(datesGridAdapter);
        datesGridView.setOnItemClickListener(getDateItemClickListener());

        // update report
        final Period monthlyElapsed = TimeReport.calculateElapsed(datesGridAdapter.getAllTimes(), getDate()
                .withDayOfMonth(1), getDate().withDayOfMonth(1).plusMonths(1));
        if (!monthlyElapsed.equals(Period.ZERO)) {
            textReportMonthlyH.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getHours()), 2, "0"));
            textReportMonthlyM.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getMinutes()), 2, "0"));
            textReportMonthlyS.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getSeconds()), 2, "0"));
        } else {
            reportLayout.setVisibility(View.INVISIBLE);
        }
    }

    /**
     * Retrieve initial arguments to the fragment Data can include: month, year,
     * dialogTitle, showNavigationArrows,(String) disableDates, selectedDates,
     * minDate, maxDate
     */
    private void retrieveInitialArgs() {
        // Get arguments
        Bundle args = getArguments();
        if (args != null) {
            // Get month, year
            month = args.getInt("month", -1);
            year = args.getInt("year", -1);
            String dialogTitle = args.getString("dialogTitle");
            if (dialogTitle != null) {
                getDialog().setTitle(dialogTitle);
            }

            // Should show arrow
            showNavigationArrows = args.getBoolean("showNavigationArrows", true);
        }
        if (month == -1 || year == -1) {
            DateTime dateTime = new DateTime();
            month = dateTime.getMonthOfYear();
            year = dateTime.getYear();
        }
    }

    /**
     * To support faster init
     * 
     * @param dialogTitle
     * @param month
     * @param year
     * @return
     */
    public static CaldroidFragment newInstance(String dialogTitle, int month, int year) {
        CaldroidFragment f = new CaldroidFragment();

        // Supply num input as an argument.
        Bundle args = new Bundle();
        args.putString("dialogTitle", dialogTitle);
        args.putInt("month", month);
        args.putInt("year", year);

        f.setArguments(args);

        return f;
    }

    /**
     * Setup view
     */
    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        retrieveInitialArgs();

        View view = inflater.inflate(R.layout.calendar_view, container, false);

        // For the monthTitleTextView
        monthTitleTextView = (TextView) view.findViewById(R.id.calendar_month_year_textview);

        // For the left arrow button
        leftArrowButton = (Button) view.findViewById(R.id.calendar_left_arrow);
        rightArrowButton = (Button) view.findViewById(R.id.calendar_right_arrow);

        leftArrowButton.setOnClickListener(new OnClickListener() {
            public void onClick(View v) {
                prevMonth();
                if (caldroidListener != null) {
                    caldroidListener.onChangeMonth(month, year);
                }
            }
        });

        rightArrowButton.setOnClickListener(new OnClickListener() {
            public void onClick(View v) {
                nextMonth();
                if (caldroidListener != null) {
                    caldroidListener.onChangeMonth(month, year);
                }
            }
        });

        setShowNavigationArrows(showNavigationArrows);

        // For the weekday gridview
        weekdayGridView = (GridView) view.findViewById(R.id.weekday_gridview);
        WeekdayArrayAdapter weekdaysAdapter = new WeekdayArrayAdapter(getActivity(),
                android.R.layout.simple_list_item_1, getDaysOfWeek());
        weekdayGridView.setAdapter(weekdaysAdapter);

        // For the dates gridview
        datesGridView = (GridView) view.findViewById(R.id.calendar_gridview);

        // add report field
        textReportMonthlyH = (TextView) view.findViewById(R.id.textViewReportMonthlyH);
        textReportMonthlyM = (TextView) view.findViewById(R.id.textViewReportMonthlyM);
        textReportMonthlyS = (TextView) view.findViewById(R.id.textViewReportMonthlyS);
        reportLayout = (LinearLayout) view.findViewById(R.id.reportLayout);

        refreshView();

        return view;
    }

    /**
     * To display the week day title
     * 
     * @return "SUN, MON, TUE, WED, THU, FRI, SAT"
     */
    private ArrayList<String> getDaysOfWeek() {
        ArrayList<String> list = new ArrayList<String>();

        // 17 Feb 2013 is Sunday
        DateTime sunday = new DateTime(2013, 2, 17, 0, 0);
        DateTime nextDay = sunday;
        while (true) {
            list.add(nextDay.dayOfWeek().getAsShortText().toUpperCase());
            nextDay = nextDay.plusDays(1);
            if (nextDay.getDayOfWeek() == DateTimeConstants.SUNDAY) {
                break;
            }
        }
        return list;
    }

    /**
     * Customize the weekday gridview
     */
    private class WeekdayArrayAdapter extends ArrayAdapter<String> {

        public WeekdayArrayAdapter(Context context, int textViewResourceId, List<String> objects) {
            super(context, textViewResourceId, objects);
        }

        // To prevent cell highlighted when clicked
        @Override
        public boolean areAllItemsEnabled() {
            return false;
        }

        @Override
        public boolean isEnabled(int position) {
            return false;
        }

        // Set color to gray and text size to 12sp
        @Override
        public View getView(int position, View convertView, ViewGroup parent) {
            // To customize text size and color
            TextView textView = (TextView) super.getView(position, convertView, parent);
            textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
            textView.setTextColor(getResources().getColor(R.color.caldroid_gray));
            textView.setGravity(Gravity.CENTER);
            return textView;
        }

    }

}
