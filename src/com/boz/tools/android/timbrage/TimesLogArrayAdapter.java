package com.boz.tools.android.timbrage;

import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;

public class TimesLogArrayAdapter extends ArrayAdapter<Date> {

    private final Context context;
    private final List<Date> values;

    static class ViewHolder {
        public TextView text;
        public ImageView deleteBtn;
    }

    public TimesLogArrayAdapter(final Context context) {
        this(context, new ArrayList<Date>());
    }

    public TimesLogArrayAdapter(final Context context, List<Date> values) {
        super(context, R.layout.time_list_item, values);
        this.context = context;
        this.values = values;
    }

    @Override
    public View getView(final int position, final View convertView, final ViewGroup parent) {
        View rowView = convertView;
        if (rowView == null) {
            final LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);

            rowView = inflater.inflate(R.layout.time_list_item, parent, false);
            ViewHolder viewHolder = new ViewHolder();
            viewHolder.text = (TextView) rowView.findViewById(R.id.timeTxt);
            viewHolder.deleteBtn = (ImageView) rowView.findViewById(R.id.deleteBtn);
            rowView.setTag(viewHolder);
        }
        ViewHolder holder = (ViewHolder) rowView.getTag();
        holder.text.setText(DateFormat.getDateTimeInstance().format(values.get(position)));
        holder.deleteBtn.setOnClickListener(new OnClickListener() {

            public void onClick(View v) {
                values.remove(position);
                notifyDataSetChanged();
            }
        });

        return rowView;
    }
}
