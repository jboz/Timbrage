package com.boz.tools.android.timbrage;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;

import android.app.Activity;
import android.os.Bundle;
import android.view.Menu;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.TextView;

public class TimbragesActivity extends Activity {
    
    private final DateFormat FORMATTER = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_timbrages);

        final Button addBtn = (Button) findViewById(R.id.btnAdd);
        addBtn.setOnClickListener(new OnClickListener() {

            public void onClick(View arg0) {
                addTime();
            }
        });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.activity_timbrages, menu);
        return true;
    }

    public void addTime() {
        ((TextView) findViewById(R.id.helloTxt)).setText(FORMATTER.format(new Date()));
        System.out.println(new Date());
    }
}
