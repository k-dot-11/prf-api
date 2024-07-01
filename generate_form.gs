function doGet(e) {
    console.log(e.parameter);
    const formTitle = e.parameter.formTitle; // Set a default if no parameter provided
    const players = e.parameter["players"].split(",");
    const subs = e.parameter["subs"].split(",");
    const url = createForm(formTitle, players, subs);
    const response = {
        message: "Successfully created form",
        url: url,
    };
    return ContentService.createTextOutput(
        JSON.stringify(response)
    ).setMimeType(ContentService.MimeType.JSON);
}

function createForm(formTitle, players, subs) {
    var form = FormApp.create(formTitle);
    form.setLimitOneResponsePerUser(true);
    var playerSection = form.addSectionHeaderItem();
    playerSection.setTitle("Players");

    for (const player of players) {
        var item = form.addScaleItem();
        item.setTitle(player).setBounds(1, 10);
    }
    var subsSection = form.addSectionHeaderItem();
    subsSection.setTitle("Subs");

    for (const sub of subs) {
        var item = form.addScaleItem();
        item.setTitle(sub).setBounds(1, 10);
    }

    Logger.log("Form URL: " + form.getPublishedUrl());
    return form.getPublishedUrl();
}
