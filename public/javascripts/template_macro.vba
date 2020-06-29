Private Sub Document_Open()

    Dim currentTable As table
    Dim currentRow As Row
    Dim firstRowSkipped As Boolean
    
    If ActiveDocument.ProtectionType <> wdNoProtection Then
        ActiveDocument.Unprotect
    End If
        
    For Each currentTable In ActiveDocument.tables
        
        If isValidTableTitle(currentTable.Title) Then
            MsgBox currentTable.Title
            
            firstRowSkipped = False
            For Each currentRow In currentTable.Rows
                If currentRow.Cells.Count = 2 Then
                    If firstRowSkipped Then
                        currentRow.Cells(2).Select
                        Selection.Editors.Add wdEditorEveryone
                    End If
                    firstRowSkipped = True
                End If
            Next
        End If

    Next
    
    ActiveDocument.Protect wdAllowOnlyReading

End Sub

Private Sub isValidTableTitle(title as String) as Boolean
    isValidTableTitle = _
        title = "0. Indicator information" _
        OR title = "1. Data reporter" _
        OR title = "2. Definition, concepts, and classifications" _
        OR title = "3. Data source type and data collection method" _
        OR title = "4. Other methodological considerations" _
        OR title = "5. Data availability and disaggregation" _
        OR title = "6. Comparability/deviation from international standards" _
        OR title = "7. References and documentation"
End Sub

Private Sub isValidControlTag(tag as String) as Boolean
    isValidControlTag = _
        tag = "ddReportingType" _
        OR tag = "ddSeries" _
        OR tag = "ddRefArea" _
        OR tag = "ddLanguage"
End Sub