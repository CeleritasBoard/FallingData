export async function schedule_cron(
  id: number,
  execDate: Date,
  table: string,
  supa: any,
) {
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
