package com.boz.tools.android.timbrage;

import java.io.File;
import java.io.PrintWriter;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Scanner;
import java.util.Timer;
import java.util.TimerTask;

import org.apache.commons.lang.StringUtils;
import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;
import org.joda.time.LocalTime;

import android.app.Activity;
import android.content.Intent;
import android.database.DataSetObserver;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.TextView;

import com.boz.tools.android.timbrage.DateTimePicker.ICustomDateTimeListener;
import com.google.common.collect.Lists;

public class TimbragesActivity extends Activity {

    public static final String FILE_PARENT = "timbrage";
    public static final String FILE_PATTERN = "times{0,date,-yyyy-MM}.csv";

    private TimesLogArrayAdapter adapter;
    private TextView textReportWillBe;
    private TextView textReportDaily;
    private TextView textReportMonthly;
    private TextView textTimeH;
    private TextView textTimeM;
    private TextView textTimeS;

    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);
        final ListView timesList = (ListView) findViewById(R.id.timesList);

        final ImageView addBtn = (ImageView) findViewById(R.id.imageViewAdd);
        addBtn.setOnClickListener(new OnClickListener() {

            public void onClick(final View v) {
                // final Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
                // final Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), notification);
                // r.play();

                adapter.add(LocalDateTime.now());
                // sort and notify
                adapter.sort();
            }
        });

        adapter = new TimesLogArrayAdapter(this, loadTimes());
        timesList.setAdapter(adapter);
        timesList.getAdapter().registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                // synchronize file
                sync(adapter.getValues());
                // reporting
                updateReport(adapter.getValues());
            }
        });
        timesList.setOnItemClickListener(new OnItemClickListener() {
            public void onItemClick(final AdapterView<?> adapter, final View view, final int position, final long arg3) {
                editTime(position);
            }
        });

        // add report field
        textReportWillBe = createTextView();
        textReportDaily = createTextView();
        textReportMonthly = createTextView();

        // check directory
        if (!new File(Environment.getExternalStorageDirectory(), FILE_PARENT).exists()) {
            new File(Environment.getExternalStorageDirectory(), FILE_PARENT).mkdir();
        }

        // load times
        updateReport(adapter.getValues());

        // current time
        textTimeH = (TextView) findViewById(R.id.textViewH);
        textTimeM = (TextView) findViewById(R.id.textViewM);
        textTimeS = (TextView) findViewById(R.id.textViewS);
        new Timer().schedule(new UpdateTimeTask(), 0, 500);
    }

    private TextView createTextView() {
        final LinearLayout layout = (LinearLayout) findViewById(R.id.reportLayout);
        final TextView textView = new TextView(this);
        textView.setTextSize(20);
        layout.addView(textView);
        return textView;
    }

    public String getFileName() {
        return MessageFormat.format(FILE_PATTERN, new Date());
    }

    private File getFile() {
        // Uri.parse("android.resource://YOUR_PACKAGENAME/" + resources);
        final String fileName = getFileName();

        return new File(new File(Environment.getExternalStorageDirectory(), FILE_PARENT), fileName);
    }

    private void editTime(final int position) {
        final DateTimePicker dateTimePicker = new DateTimePicker(this, new ICustomDateTimeListener() {

            public void onSet(final LocalDateTime dateTime) {
                // remove previous
                adapter.getValues().remove(position);
                // finally set new date
                adapter.getValues().add(position, dateTime);
                // sort and notify
                adapter.sort();
            }

            public void onCancel() {
            }
        });
        dateTimePicker.set24HourFormat(true);
        dateTimePicker.setDateTime(adapter.getValues().get(position));
        dateTimePicker.showDialog();
    }

    @Override
    public boolean onMenuItemSelected(int featureId, MenuItem item) {
        switch (item.getItemId()) {
            case R.id.itemShare:
                shareIt();
                break;
        }
        return super.onMenuItemSelected(featureId, item);
    }

    private void shareIt() {
        // sharing implementation
        final Intent share = new Intent(Intent.ACTION_SEND);
        share.putExtra(Intent.EXTRA_SUBJECT, MessageFormat.format(getString(R.string.send_subject), new Date()));

        final String monthly = TimeReport.report(adapter.getValues(), LocalDate.now().withDayOfMonth(1), LocalDate
                .now().withDayOfMonth(1).plusMonths(1));
        share.putExtra(Intent.EXTRA_TEXT, MessageFormat.format(getString(R.string.send_object), monthly));
        final Uri uri = Uri.fromFile(getFile());
        share.putExtra(Intent.EXTRA_STREAM, uri);
        share.setType("text/plain"); // TODO define file content
        startActivity(Intent.createChooser(share, "Share times with..."));

    }

    @Override
    public boolean onCreateOptionsMenu(final Menu menu) {
        getMenuInflater().inflate(R.menu.activity_timbrages, menu);
        return true;
    }

    public List<LocalDateTime> loadTimes() {
        final List<LocalDateTime> times = new ArrayList<LocalDateTime>();
        try {
            final Scanner scanner = new Scanner(getFile());

            while (scanner.hasNext()) {
                final String time = scanner.nextLine();
                times.add(LocalDateTime.parse(time));
            }
            scanner.close();

        } catch (final Exception e) {
            e.printStackTrace();
        }

        return times;
    }

    public void sync(final List<LocalDateTime> times) {
        if (Environment.getExternalStorageDirectory().canWrite()) {
            try {
                final PrintWriter writer = new PrintWriter(getFile());

                for (final LocalDateTime timeLog : times) {
                    writer.println(timeLog.toString());
                }

                writer.close();
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }
    }

    public void updateReport(final List<LocalDateTime> times) {

        final String daily = TimeReport.report(times, LocalDate.now());
        final String monthly = TimeReport.report(times, LocalDate.now().withDayOfMonth(1), LocalDate.now()
                .withDayOfMonth(1).plusMonths(1));

        textReportDaily.setText(MessageFormat.format(getString(R.string.reporting_daily), daily));
        textReportMonthly.setText(MessageFormat.format(getString(R.string.reporting_monthly), monthly));
    }

    class UpdateTimeTask extends TimerTask {

        @Override
        public void run() {
            TimbragesActivity.this.runOnUiThread(new Runnable() {

                public void run() {
                    // current time update
                    final LocalTime now = LocalTime.now();
                    textTimeH.setText(StringUtils.leftPad(String.valueOf(now.getHourOfDay()), 2, "0"));
                    textTimeM.setText(StringUtils.leftPad(String.valueOf(now.getMinuteOfHour()), 2, "0"));
                    textTimeS.setText(StringUtils.leftPad(String.valueOf(now.getSecondOfMinute()), 2, "0"));

                    // elapsed time report
                    if (adapter.getValues().size() % 2 != 0) {
                        final List<LocalDateTime> times2 = Lists.newArrayList(adapter.getValues());
                        times2.add(LocalDateTime.now());
                        // reporting
                        final String willBe = TimeReport.report(times2, LocalDate.now());
                        textReportWillBe.setText(MessageFormat.format(getString(R.string.reporting_willBe), willBe));
                    } else {
                        // no need elapsed time
                        textReportWillBe.setText("");
                    }
                }
            });
        }
    };
}
