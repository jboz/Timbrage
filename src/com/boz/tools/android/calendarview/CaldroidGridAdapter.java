package com.boz.tools.android.calendarview;

import java.io.File;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.joda.time.DateTime;
import org.joda.time.DateTimeConstants;
import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;
import org.joda.time.Period;

import android.content.Context;
import android.content.res.Resources;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.boz.tools.android.timbrage.R;
import com.boz.tools.android.timbrage.TimbragesActivity;
import com.boz.tools.android.timbrage.TimeReport;

/**
 * The CaldroidGridAdapter provides customized view for the dates gridview
 * 
 * @author thomasdao
 */
public class CaldroidGridAdapter extends BaseAdapter {
    protected List<LocalDate> datetimeList;
    protected int month;
    protected int year;
    protected Context context;
    private List<LocalDateTime> times;

    public CaldroidGridAdapter(Context context, int month, int year) {
        super();
        this.month = month;
        this.year = year;
        this.context = context;
        this.datetimeList = CalendarHelper.getFullWeeks(this.month, this.year);
        final File file = TimbragesActivity.getFile(getDate());
        if (file.exists()) {
            times = TimeReport.loadTimes(TimbragesActivity.getFile(getDate()), context);
        } else {
            times = null;
        }
    }

    private Date getDate() {
        return LocalDate.now().withMonthOfYear(month).withYear(year).toDate();
    }

    public int getCount() {
        return this.datetimeList.size();
    }

    public Object getItem(int arg0) {
        // TODO Auto-generated method stub
        return null;
    }

    public long getItemId(int arg0) {
        // TODO Auto-generated method stub
        return 0;
    }

    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        LinearLayout cell = (LinearLayout) inflater.inflate(R.layout.date_cell, null);
        TextView dayOfMonth = (TextView) cell.findViewById(R.id.dayOfMonth);
        TextView textRecapH = (TextView) cell.findViewById(R.id.textViewRecapH);
        TextView textRecapM = (TextView) cell.findViewById(R.id.textViewRecapM);

        // Get dateTime of this cell
        LocalDate dateTime = this.datetimeList.get(position);
        Resources resources = context.getResources();

        // Set color of the dates in previous / next month
        if (dateTime.getMonthOfYear() != month) {
            textRecapH.setTextColor(resources.getColor(R.color.caldroid_darker_gray));
            textRecapM.setTextColor(resources.getColor(R.color.caldroid_darker_gray));
            dayOfMonth.setTextColor(resources.getColor(R.color.caldroid_darker_gray));
        } else {
            dayOfMonth.setTextColor(CaldroidFragment.disabledTextColor);
        }

        if (dateTime.equals(DateTime.now())) {
            cell.setBackgroundResource(R.drawable.red_border);
        }

        // disabled date
        if (dateTime.getDayOfWeek() == DateTimeConstants.SATURDAY
                || dateTime.getDayOfWeek() == DateTimeConstants.SUNDAY) {
            textRecapH.setTextColor(CaldroidFragment.disabledTextColor);
            textRecapM.setTextColor(CaldroidFragment.disabledTextColor);

            cell.setBackgroundResource(R.drawable.disable_cell);

            if (dateTime.equals(DateTime.now())) {
                cell.setBackgroundResource(R.drawable.red_border_gray_bg);
            }
        }

        // Customize for selected dates
        // if (CaldroidFragment.selectedBackgroundDrawable != -1) {
        // cellView.setBackgroundResource(CaldroidFragment.selectedBackgroundDrawable);
        // } else {
        // cellView.setBackgroundColor(resources.getColor(R.color.caldroid_sky_blue));
        // }
        //
        // cellView.setTextColor(CaldroidFragment.selectedTextColor);

        dayOfMonth.setText("" + dateTime.getDayOfMonth());
        final Period recapDay = TimeReport.calculateTimes(times, dateTime);
        if (!recapDay.equals(Period.ZERO)) {
            textRecapH.setText(StringUtils.leftPad(String.valueOf(recapDay.getHours()), 2, "0"));
            textRecapM.setText(StringUtils.leftPad(String.valueOf(recapDay.getMinutes()), 2, "0"));
        } else {
            ((LinearLayout) cell.findViewById(R.id.recapGroupLayout)).setVisibility(View.INVISIBLE);
        }

        return cell;
    }

    public Iterable<LocalDateTime> getAllTimes() {
        return times;
    }

}
