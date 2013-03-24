package com.boz.tools.android.timbrage;

import java.util.Date;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;

public class TimbragesActivity extends Activity {

    private ListView timesList;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);

        final Button addBtn = (Button) findViewById(R.id.btnAdd);
        addBtn.setOnClickListener(new OnClickListener() {

            public void onClick(View v) {
                addTime();
            }
        });

        timesList = (ListView) findViewById(R.id.timesList);
        timesList.setAdapter(new TimesLogArrayAdapter(getApplicationContext()));

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_timbrages, menu);
        return true;
    }

    @SuppressWarnings("unchecked")
    public void addTime() {
        ((ArrayAdapter<Date>) timesList.getAdapter()).add(new Date());
    }
}
