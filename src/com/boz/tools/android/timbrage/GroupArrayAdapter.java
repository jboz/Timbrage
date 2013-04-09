package com.boz.tools.android.timbrage;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.joda.time.LocalDateTime;
import org.joda.time.Period;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.database.DataSetObserver;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.boz.tools.android.timbrage.DateTimePicker.ICustomDateTimeListener;
import com.google.common.base.Optional;
import com.google.common.base.Predicate;
import com.google.common.base.Supplier;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Ordering;

public class GroupArrayAdapter extends ArrayAdapter<Group> {

    private final Activity activity;
    private final List<Group> groups;

    static class ViewHolder {
        public TextView textDay;
        public TextView textRecapH;
        public TextView textRecapM;
        public ListView listView;
    }

    public GroupArrayAdapter(final Activity activity) {
        this(activity, new ArrayList<Group>());
    }

    public GroupArrayAdapter(final Activity activity, final List<Group> groups) {
        super(activity.getApplicationContext(), R.layout.groups_list_item, groups);
        this.activity = activity;
        this.groups = groups;
        sort();
    }

    public void sort() {
        sort(Ordering.natural().reverse());
    }

    public List<Group> getGroups() {
        return groups;
    }

    public void add(final LocalDateTime time) {
        tryFind(time, groups).or(new Supplier<Group>() {
            public Group get() {
                final Group group = new Group(time.toLocalDate());
                groups.add(group);
                return group;
            }
        }).add(time);
        sort();
    }

    public void remove(final LocalDateTime time) {
        final Group group = tryFind(time, groups).or(new Supplier<Group>() {
            public Group get() {
                final Group group = new Group(time.toLocalDate());
                groups.add(group);
                return group;
            }
        });
        group.remove(time);
        if (group.times.isEmpty()) {
            groups.remove(group);
        }
        sort();
    }

    public static Optional<Group> tryFind(final LocalDateTime time, final List<Group> groups) {
        return Iterables.tryFind(groups, new Predicate<Group>() {
            public boolean apply(final Group group) {
                return group.date.equals(time.toLocalDate());
            }
        });
    }

    @Override
    public View getView(final int position, final View convertView, final ViewGroup parent) {
        View rowView = convertView;
        ViewHolder holder = null;
        final Group group = groups.get(position);
        if (rowView == null) {
            final LayoutInflater inflater = (LayoutInflater) activity.getApplicationContext().getSystemService(
                    Context.LAYOUT_INFLATER_SERVICE);

            rowView = inflater.inflate(R.layout.groups_list_item, parent, false);
            holder = new ViewHolder();
            holder.textDay = (TextView) rowView.findViewById(R.id.textViewDay);
            holder.textRecapH = (TextView) rowView.findViewById(R.id.textViewRecapH);
            holder.textRecapM = (TextView) rowView.findViewById(R.id.textViewRecapM);
            holder.listView = (ListView) rowView.findViewById(R.id.listViewTimes);
            rowView.setTag(holder);
        }
        holder = (ViewHolder) rowView.getTag();
        holder.textDay.setText(group.date.toString("EEEE dd MMM"));
        final Period recapDay = TimeReport.calculateTimes(group.times, group.date);
        holder.textRecapH.setText(StringUtils.leftPad(String.valueOf(recapDay.getHours()), 2, "0"));
        holder.textRecapM.setText(StringUtils.leftPad(String.valueOf(recapDay.getMinutes()), 2, "0"));

        final TimesArrayAdapter timesAdapter = new TimesArrayAdapter(activity, group.times);
        holder.listView.setAdapter(timesAdapter);
        holder.listView.setOnItemClickListener(new OnItemClickListener() {
            public void onItemClick(final AdapterView<?> adapter, final View view, final int position, final long arg3) {

                final DateTimePicker dateTimePicker = new DateTimePicker(activity, new ICustomDateTimeListener() {

                    public void onSet(final LocalDateTime dateTime) {
                        // remove previous
                        group.times.remove(position);
                        // finally set new date
                        GroupArrayAdapter.this.add(dateTime);

                        Toast.makeText(activity,
                                MessageFormat.format(activity.getString(R.string.time_updated), dateTime.toDate()),
                                Toast.LENGTH_SHORT).show();
                    }

                    public void onCancel() {
                    }
                });
                dateTimePicker.set24HourFormat(true);
                dateTimePicker.setDateTime(group.times.get(position));
                dateTimePicker.showDialog();
            }
        });
        holder.listView.getAdapter().registerDataSetObserver(new DataSetObserver() {
            @Override
            public void onChanged() {
                // look for empty groups
                for (Group emptyGroup : Lists.newArrayList(Iterables.filter(groups, new Predicate<Group>() {
                    public boolean apply(final Group group) {
                        return group.times.isEmpty();
                    }
                }))) {
                    // remove empty group
                    remove(emptyGroup);
                }
                GroupArrayAdapter.this.notifyDataSetChanged();
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

    public static List<Group> group(final List<LocalDateTime> times) {
        final List<Group> groups = new ArrayList<Group>();
        for (final LocalDateTime time : times) {
            tryFind(time, groups).or(new Supplier<Group>() {
                public Group get() {
                    final Group group = new Group(time.toLocalDate());
                    groups.add(group);
                    return group;
                }
            }).add(time);
        }
        return groups;
    }

    public List<LocalDateTime> getAllTimes() {
        final List<LocalDateTime> times = new ArrayList<LocalDateTime>();
        for (Group group : groups) {
            times.addAll(group.times);
        }
        return times;
    }
}
