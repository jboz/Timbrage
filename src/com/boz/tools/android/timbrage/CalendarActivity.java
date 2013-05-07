package com.boz.tools.android.timbrage;

import java.util.Date;

import org.joda.time.LocalDate;

import android.content.Intent;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.support.v4.app.FragmentTransaction;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;

import com.boz.tools.android.calendarview.CaldroidFragment;
import com.boz.tools.android.calendarview.CaldroidListener;

public class CalendarActivity extends FragmentActivity {

    private int month = LocalDate.now().getMonthOfYear();
    private int year = LocalDate.now().getYear();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_calendar);

        // Setup caldroid fragment
        // **** If you want normal CaldroidFragment, use below line ****
        final CaldroidFragment caldroidFragment = new CaldroidFragment();

        // This is to show customized fragment
        // **** If you want customized version, uncomment below line ****
        // final CaldroidSampleCustomFragment caldroidFragment = new CaldroidSampleCustomFragment();

        // Setup arguments
        Bundle args = new Bundle();
        args.putInt("month", month);
        args.putInt("year", year);
        caldroidFragment.setArguments(args);

        FragmentTransaction t = getSupportFragmentManager().beginTransaction();
        t.replace(R.id.calendar1, caldroidFragment);
        t.commit();

        // listener
        caldroidFragment.setCaldroidListener(new CaldroidListener() {

            @Override
            public void onSelectDate(Date date, View view) {
            }

            @Override
            public void onChangeMonth(int month, int year) {
                setMonth(month);
                setYear(year);
            }
        });

    }

    public void setMonth(int month) {
        this.month = month;
    }

    public void setYear(int year) {
        this.year = year;
    }

    private LocalDate getDate() {
        return LocalDate.now().withMonthOfYear(month).withYear(year);
    }

    @Override
    public boolean onCreateOptionsMenu(final Menu menu) {
        getMenuInflater().inflate(R.menu.activity_calendar, menu);
        return true;
    }

    @Override
    public boolean onMenuItemSelected(int featureId, MenuItem item) {
        switch (item.getItemId()) {
            case R.id.itemShare:
                TimbragesActivity.shareIt(this,
                        TimeReport.loadTimes(TimbragesActivity.getFile(getDate().toDate()), this), getDate());
                break;
            case R.id.itemCalendar:
                final Intent toTimbrages = new Intent(this, TimbragesActivity.class);
                startActivity(toTimbrages);
                break;
        }
        return super.onMenuItemSelected(featureId, item);
    }
}
