package com.boz.tools.android.timbrage;

import java.io.File;
import java.text.MessageFormat;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

import org.apache.commons.lang.StringUtils;
import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;
import org.joda.time.Period;

import android.app.Activity;
import android.content.Intent;
import android.database.DataSetObserver;
import android.media.MediaPlayer;
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
import android.widget.Toast;

import com.boz.tools.android.timbrage.DateTimePicker.ICustomDateTimeListener;

public class TimbragesActivity extends Activity implements OnClickListener {

    public static final String FILE_PARENT = "timbrage";
    public static final String FILE_PATTERN = "times{0,date,-yyyy-MM}.csv";

    private TimesLogArrayAdapter adapter;
    private TextView textReportMonthly;
    private TextView textTimeH;
    private TextView textTimeM;
    private TextView textTimeS;

    private MediaPlayer player;

    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);
        final ListView timesList = (ListView) findViewById(R.id.timesList);

        final ImageView addBtn = (ImageView) findViewById(R.id.imageViewAdd);
        addBtn.setOnClickListener(this);
        if (android.os.Build.VERSION.SDK_INT >= 10) {
            addBtn.setImageResource(R.drawable.plus2);
        }

        adapter = new TimesLogArrayAdapter(this, TimeReport.loadTimes(getFile()));
        timesList.setAdapter(adapter);
        timesList.getAdapter().registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                // synchronize file
                TimeReport.sync(adapter.getValues(), getFile());
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

        player = MediaPlayer.create(this, R.raw.beep);
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

    public void onClick(final View v) {
        // final Uri notification = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        // final Ringtone r = RingtoneManager.getRingtone(getApplicationContext(), notification);
        // r.play();
        new Thread() {
            public void run() {
                player.start();
            }
        }.start();

        adapter.add(LocalDateTime.now());
        // sort and notify
        adapter.sort();

        Toast.makeText(TimbragesActivity.this, MessageFormat.format(getString(R.string.time_added), new Date()),
                Toast.LENGTH_SHORT).show();
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

                Toast.makeText(TimbragesActivity.this,
                        MessageFormat.format(getString(R.string.time_updated), dateTime.toDate()), Toast.LENGTH_SHORT)
                        .show();
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
        // case R.id.itemCalendar:
        // final Intent toCalendar = new Intent(this, CalendarActivity.class);
        // startActivity(toCalendar);
        // break;
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

    public void updateReport(final List<LocalDateTime> times) {

        // final String daily = TimeReport.report(times, LocalDate.now());
        final String monthly = TimeReport.report(times, LocalDate.now().withDayOfMonth(1), LocalDate.now()
                .withDayOfMonth(1).plusMonths(1));

        // textReportDaily.setText(MessageFormat.format(getString(R.string.reporting_daily), daily));
        textReportMonthly.setText(MessageFormat.format(getString(R.string.reporting_monthly), monthly));
    }

    class UpdateTimeTask extends TimerTask {

        @Override
        public void run() {
            TimbragesActivity.this.runOnUiThread(new Runnable() {

                public void run() {
                    // calculate daily elapsed time
                    final Period dailyElapsed = TimeReport.calculateElapsed(adapter.getValues());
                    textTimeH.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getHours()), 2, "0"));
                    textTimeM.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getMinutes()), 2, "0"));
                    textTimeS.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getSeconds()), 2, "0"));
                }
            });
        }
    };
}
