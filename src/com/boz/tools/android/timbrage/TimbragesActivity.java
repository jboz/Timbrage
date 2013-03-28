package com.boz.tools.android.timbrage;

import java.io.File;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.joda.time.LocalDate;
import org.joda.time.LocalDateTime;

import android.app.Activity;
import android.content.Intent;
import android.database.DataSetObserver;
import android.os.Bundle;
import android.os.Environment;
import android.view.ContextMenu;
import android.view.ContextMenu.ContextMenuInfo;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;

import com.boz.tools.android.timbrage.DateTimePicker.ICustomDateTimeListener;
import com.google.common.collect.Ordering;

public class TimbragesActivity extends Activity {

    public static final String FILE = "times.csv";

    private ListView timesList;
    private TimesLogArrayAdapter adapter;

    @Override
    public void onCreate(final Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);

        final Button addBtn = (Button) findViewById(R.id.btnAdd);
        addBtn.setOnClickListener(new OnClickListener() {

            public void onClick(final View v) {
                addTime();
            }
        });

        timesList = (ListView) findViewById(R.id.timesList);
        adapter = new TimesLogArrayAdapter(this, loadTimes());
        timesList.setAdapter(adapter);
        timesList.getAdapter().registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                sync(adapter.getValues());
                updateReport(adapter.getValues());
            }
        });
        timesList.setOnItemClickListener(new OnItemClickListener() {
            public void onItemClick(final AdapterView<?> adapter, final View view, final int position, final long arg3) {
                editTime(position);
            }
        });

        updateReport(adapter.getValues());
    }

    private void editTime(final int position) {
        final DateTimePicker dateTimePicker = new DateTimePicker(this, new ICustomDateTimeListener() {

            public void onSet(final LocalDateTime dateTime) {

                // remove previous
                adapter.getValues().remove(position);
                // finally set new date
                adapter.getValues().add(position, dateTime);
                // sort and notify
                adapter.sort(Ordering.natural());
            }

            public void onCancel() {
            }
        });
        dateTimePicker.set24HourFormat(true);
        dateTimePicker.setDateTime(adapter.getValues().get(position));
        dateTimePicker.showDialog();
    }

    @Override
    public void onCreateContextMenu(final ContextMenu menu, final View v, final ContextMenuInfo menuInfo) {

        // final MenuItem itemShare = (MenuItem) findViewById(R.id.itemShare);
        final Intent intent = new Intent(Intent.ACTION_SEND);
        intent.putExtra(Intent.EXTRA_TEXT, "Sended text");
        intent.setType("text/plain"); // TODO define file content
        startActivity(Intent.createChooser(intent, "Share times with..."));

        // TODO Auto-generated method stub
        super.onCreateContextMenu(menu, v, menuInfo);
    }

    @Override
    public boolean onCreateOptionsMenu(final Menu menu) {
        getMenuInflater().inflate(R.menu.activity_timbrages, menu);
        return true;
    }

    @SuppressWarnings("unchecked")
    public void addTime() {
        ((ArrayAdapter<LocalDateTime>) timesList.getAdapter()).add(LocalDateTime.now());
    }

    public List<LocalDateTime> loadTimes() {
        final List<LocalDateTime> times = new ArrayList<LocalDateTime>();
        try {
            final Scanner scanner = new Scanner(new File(Environment.getExternalStorageDirectory(), FILE));

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
                final PrintWriter writer = new PrintWriter(new File(Environment.getExternalStorageDirectory(), FILE));

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
        // reporting
        ((TextView) findViewById(R.id.textReportDay)).setText("Daily report : "
                + TimeReport.report(times, LocalDate.now()));
        ((TextView) findViewById(R.id.textReportMonth)).setText("Monthly report : "
                + TimeReport.report(times, LocalDate.now().withDayOfMonth(1), LocalDate.now().withDayOfMonth(1)
                        .plusMonths(1)));
    }
}
