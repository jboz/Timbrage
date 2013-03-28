package com.boz.tools.android.timbrage;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.joda.time.LocalDateTime;

import android.app.Activity;
import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.common.collect.Ordering;

public class TimesLogArrayAdapter extends ArrayAdapter<LocalDateTime> {

    private final Activity activity;
    private final List<LocalDateTime> values;
    private final DateFormat dateFormat = new SimpleDateFormat("dd/MM HH:mm:ss, EEEE", Locale.getDefault());

    static class ViewHolder {
        public TextView text;
        public ImageView deleteBtn;
    }

    public TimesLogArrayAdapter(final Activity activity) {
        this(activity, new ArrayList<LocalDateTime>());
    }

    public TimesLogArrayAdapter(final Activity activity, final List<LocalDateTime> values) {
        super(activity.getApplicationContext(), R.layout.time_list_item, values);
        this.activity = activity;
        this.values = values;
        sort(Ordering.natural());
    }

    public List<LocalDateTime> getValues() {
        return values;
    }

    @Override
    public View getView(final int position, final View convertView, final ViewGroup parent) {
        View rowView = convertView;
        if (rowView == null) {
            final LayoutInflater inflater = (LayoutInflater) activity.getApplicationContext().getSystemService(
                    Context.LAYOUT_INFLATER_SERVICE);

            rowView = inflater.inflate(R.layout.time_list_item, parent, false);
            final ViewHolder viewHolder = new ViewHolder();
            viewHolder.text = (TextView) rowView.findViewById(R.id.timeTxt);
            viewHolder.deleteBtn = (ImageView) rowView.findViewById(R.id.deleteBtn);
            rowView.setTag(viewHolder);
        }
        final ViewHolder holder = (ViewHolder) rowView.getTag();
        holder.text.setText(dateFormat.format(values.get(position).toDate()));
        holder.deleteBtn.setOnClickListener(new OnClickListener() {

            public void onClick(final View v) {
                values.remove(position);
                sort(Ordering.natural()); // sort and notify
            }
        });

        return rowView;
    }
}
