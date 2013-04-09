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
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

public class TimbragesActivity extends Activity implements OnClickListener {

    public static final String FILE_PARENT = "timbrage";
    public static final String FILE_PATTERN = "times{0,date,-yyyy-MM}.csv";

    private GroupArrayAdapter adapter;
    private TextView textReportMonthlyH;
    private TextView textReportMonthlyM;
    private TextView textReportMonthlyS;
    private TextView textTimeH;
    private TextView textTimeM;
    private TextView textTimeS;

    private ImageView addBtn;

    private MediaPlayer player;

    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);

        addBtn = (ImageView) findViewById(R.id.imageViewAdd);
        addBtn.setOnClickListener(this);

        adapter = new GroupArrayAdapter(this, GroupArrayAdapter.group(TimeReport.loadTimes(getFile())));
        final ListView timesList = (ListView) findViewById(R.id.timesList);
        timesList.setAdapter(adapter);
        timesList.getAdapter().registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                // reporting
                timesChanged(adapter.getAllTimes());
            }
        });

        // add report field
        textReportMonthlyH = (TextView) findViewById(R.id.textViewReportMonthlyH);
        textReportMonthlyM = (TextView) findViewById(R.id.textViewReportMonthlyM);
        textReportMonthlyS = (TextView) findViewById(R.id.textViewReportMonthlyS);

        // check directory
        if (!new File(Environment.getExternalStorageDirectory(), FILE_PARENT).exists()) {
            new File(Environment.getExternalStorageDirectory(), FILE_PARENT).mkdir();
        }

        // load times
        timesChanged(adapter.getAllTimes());

        // current time
        textTimeH = (TextView) findViewById(R.id.textViewH);
        textTimeM = (TextView) findViewById(R.id.textViewM);
        textTimeS = (TextView) findViewById(R.id.textViewS);
        // start thread to update time and report
        new Timer().schedule(new UpdateTimeTask(), 0, 500);

        player = MediaPlayer.create(this, R.raw.beep);
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

        Toast.makeText(TimbragesActivity.this, MessageFormat.format(getString(R.string.time_added), new Date()),
                Toast.LENGTH_SHORT).show();
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

        final String monthly = TimeReport.report(adapter.getAllTimes(), LocalDate.now().withDayOfMonth(1), LocalDate
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

    public void timesChanged(final List<LocalDateTime> times) {
        // synchronize file
        // TODO make async ? non UI thread ? take care of multi thread adapter list access
        TimeReport.sync(adapter.getAllTimes(), getFile());

        // update btn add icon
        if (adapter.getAllTimes().size() % 2 != 0) {
            // working
            addBtn.setImageResource(R.drawable.plus2_red);
        } else {
            // not working
            addBtn.setImageResource(R.drawable.plus2_green);
        }
    }

    class UpdateTimeTask extends TimerTask {

        @Override
        public void run() {
            TimbragesActivity.this.runOnUiThread(new Runnable() {

                public void run() {
                    // calculate daily elapsed time
                    final Period dailyElapsed = TimeReport.calculateElapsed(adapter.getAllTimes(), LocalDate.now());
                    textTimeH.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getHours()), 2, "0"));
                    textTimeM.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getMinutes()), 2, "0"));
                    textTimeS.setText(StringUtils.leftPad(String.valueOf(dailyElapsed.getSeconds()), 2, "0"));

                    // update report
                    final Period monthlyElapsed = TimeReport.calculateElapsed(adapter.getAllTimes(), LocalDate.now()
                            .withDayOfMonth(1), LocalDate.now().withDayOfMonth(1).plusMonths(1));
                    textReportMonthlyH.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getHours()), 2, "0"));
                    textReportMonthlyM.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getMinutes()), 2, "0"));
                    textReportMonthlyS.setText(StringUtils.leftPad(String.valueOf(monthlyElapsed.getSeconds()), 2, "0"));
                }
            });
        }
    };
}
