package com.boz.tools.android.timbrage;

import java.text.DateFormat;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.joda.time.LocalDateTime;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

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
        sort();
    }

    public void sort() {
        sort(Ordering.natural().reverse());
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
                final String title = MessageFormat.format(activity.getString(R.string.delete_title),
                        values.get(position).toDate());

                // confirmation dialog
                new AlertDialog.Builder(activity).setTitle(title).setMessage(R.string.delete_message)
                        .setIcon(android.R.drawable.ic_dialog_alert)
                        .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {

                            public void onClick(DialogInterface dialog, int whichButton) {
                                // remove on confirm
                                final LocalDateTime removed = values.remove(position);
                                sort(); // sort and notify

                                Toast.makeText(
                                        activity,
                                        MessageFormat.format(activity.getString(R.string.time_deleted),
                                                removed.toDate()), Toast.LENGTH_SHORT).show();
                            }
                        }).setNegativeButton(android.R.string.no, null).show();
            }
        });

        return rowView;
    }

    /**
     * Display a confirm dialog.
     * 
     * @param activity
     * @param title
     * @param message
     * @param positiveLabel
     * @param negativeLabel
     * @param onPositiveClick runnable to call (in UI thread) if positive button pressed. Can be null
     * @param onNegativeClick runnable to call (in UI thread) if negative button pressed. Can be null
     */
    public static final void confirm(final Activity activity, final int title, final int message,
            final int positiveLabel, final int negativeLabel, final Runnable onPositiveClick,
            final Runnable onNegativeClick) {

        AlertDialog.Builder dialog = new AlertDialog.Builder(activity);
        dialog.setTitle(title);
        dialog.setMessage(message);
        dialog.setCancelable(false);
        dialog.setPositiveButton(positiveLabel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int buttonId) {
                if (onPositiveClick != null)
                    onPositiveClick.run();
            }
        });
        dialog.setIcon(android.R.drawable.ic_dialog_alert);
        dialog.show();
    }

}
