function doGet(e) {
  const formTitle = e.parameter.formTitle ; // Set a default if no parameter provided
  const players = e.parameter["players"].split(',')
  const subs = e.parameter["subs"].split(',')
  const email = e.parameter.email;

  const result = createForm(formTitle, players, subs , email);
  const response =  {
    message : "Successfully created form",
    url : result.url,
    editURL : result.editURL
  };
  deleteForms()
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function createForm(formTitle, players, subs , email) {
  var form = FormApp.create(formTitle);
  form.setLimitOneResponsePerUser(true)
  var playerSection = form.addSectionHeaderItem();
  playerSection.setTitle('Players');
  
  for (const player of players) {
    var item = form.addScaleItem()
    item.setTitle(player).setBounds(1 , 10)
  }
  var subsSection = form.addSectionHeaderItem();
  subsSection.setTitle('Subs');
  
  for (const sub of subs) {
    var item = form.addScaleItem()
    item.setTitle(sub).setBounds(1 , 10)
  }
  form.addEditor(email);
  Logger.log('Form URL: ' + form.getPublishedUrl());
  return {
    url : form.getPublishedUrl(),
    editURL : form.getEditUrl()
  }
}

function deleteForm(){
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_FORMS);
  const daysToKeep = 21;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - daysToKeep);
  while (files.hasNext()) {
    const file = files.next();
    const dateCreated = file.getDateCreated()
        if (dateCreated.getTime() < threshold.getTime()) {
          file.setTrashed(true);
        }
  }
}





