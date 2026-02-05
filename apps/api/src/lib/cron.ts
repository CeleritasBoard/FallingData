export async function schedule_cron(
  id: number,
  date: Date,
  table: string,
  supa: any,
) {
  const execDate: Date = date < new Date() ? new Date() : date;
  console.log(
    execDate.toUTCString(),
    `${execDate.getMinutes() + 1} ${execDate.getUTCHours()} ${execDate.getDate()} ${execDate.getMonth() + 1} *`,
  );
  const { error: scheduleError } = await supa.rpc(`schedule_${table}`, {
    id: id,
    cron_time: `${execDate.getMinutes() + 1} ${execDate.getUTCHours()} ${execDate.getDate()} ${execDate.getMonth() + 1} *`,
  });
  if (scheduleError) {
    console.error(scheduleError);
    return false;
  }

  return true;
}

export async function unschedule_cron(id: number, table: string, supa: any) {
  const { error: scheduleError } = await supa.rpc(`unschedule_cron`, {
    job: `upload-${table}-${id}`,
  });
  if (scheduleError) {
    console.error(scheduleError);
    return false;
  }

  return true;
}
